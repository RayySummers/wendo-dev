import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import { isAbsolute, relative, sep } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class PdfRenderError extends Error {
  readonly details: string;

  constructor(message: string, details = "") {
    super(message);
    this.name = "PdfRenderError";
    this.details = details;
  }
}

export interface RenderPdfOptions {
  /** Typst 项目根目录（通常是 agent/），模板与报告 JSON 都必须在其中。 */
  root: string;
  /** 报告 JSON 的绝对路径。 */
  reportJsonPath: string;
  /** 输出 PDF 的绝对路径。 */
  outputPath: string;
  templatePath?: string;
  timeoutMs?: number;
  typstBinary?: string;
}

function toPosix(value: string): string {
  return value.split(sep).join("/");
}

function insideRoot(root: string, target: string): string {
  const rel = relative(root, target);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) {
    throw new PdfRenderError(`文件必须位于 Typst 根目录内：${target}`);
  }
  return toPosix(rel);
}

/**
 * Typst 渲染：报告 JSON 是唯一数据源，模板只做排版。
 * 网页与 PDF 因此共享同一份内容，不存在两套文案。
 */
export async function renderPdf(options: RenderPdfOptions): Promise<{ bytes: number }> {
  const binary = options.typstBinary ?? process.env.WENDO_TYPST ?? "typst";
  const templatePath = options.templatePath ?? `${options.root}/report.typ`;
  const reportRel = insideRoot(options.root, options.reportJsonPath);
  const templateRel = insideRoot(options.root, templatePath);
  // Typst 的 json() 接受相对项目根的路径，而不是 JSON 字符串。
  const reportRelToTemplate = reportRel;

  try {
    await execFileAsync(binary, ["--version"], { timeout: 10_000 });
  } catch {
    throw new PdfRenderError(
      `找不到 Typst（${binary}）。请安装 Typst 0.13+，或设置 WENDO_TYPST 指向可执行文件。`,
    );
  }

  try {
    await execFileAsync(
      binary,
      [
        "compile",
        "--root",
        options.root,
        "--input",
        `report=${reportRelToTemplate}`,
        templateRel,
        options.outputPath,
      ],
      {
        cwd: options.root,
        timeout: options.timeoutMs ?? 60_000,
        maxBuffer: 8 * 1024 * 1024,
      },
    );
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { stderr?: string; stdout?: string };
    const detail = (err.stderr || err.stdout || err.message || "").trim().slice(0, 2000);
    throw new PdfRenderError("Typst 编译失败，PDF 未生成。", detail);
  }

  const info = await stat(options.outputPath).catch(() => undefined);
  if (!info || info.size < 2_000) {
    throw new PdfRenderError("Typst 报告生成了空文件或过小的 PDF。");
  }
  return { bytes: info.size };
}
