import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { FetchedPage } from "../types.js";

const execFileAsync = promisify(execFile);

const SCRIPT_PATH = fileURLToPath(new URL("../../scripts/scrape_page.py", import.meta.url));

export class FetchPageError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FetchPageError";
    this.code = code;
  }
}

export interface FetchPageOptions {
  url: string;
  /** 抓取超时（秒），默认 30。 */
  timeoutSeconds?: number;
  /** 正文上限，默认 20000 字符，避免把整页噪音塞进上下文。 */
  maxChars?: number;
  /** 覆盖 Python 解释器，默认 $WENDO_PYTHON 或 python3。 */
  python?: string;
}

function parseScraplingError(stderr: string): { code: string; message: string } | undefined {
  const lines = stderr.trim().split("\n").reverse();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const parsed = JSON.parse(trimmed) as { error?: string; message?: string };
      if (parsed.error) {
        return { code: parsed.error, message: parsed.message ?? parsed.error };
      }
    } catch {
      // 不是 JSON，继续找
    }
  }
  return undefined;
}

/**
 * fetch_page：固定工具链第 1 步。
 * 通过 Scrapling 抓取单个页面；失败时抛出带错误码的异常，绝不返回空页面。
 */
export async function fetchPage(options: FetchPageOptions): Promise<FetchedPage> {
  const timeoutSeconds = options.timeoutSeconds ?? 30;
  const maxChars = options.maxChars ?? 20_000;
  const python = options.python ?? process.env.WENDO_PYTHON ?? "python3";

  let dir: string | undefined;
  try {
    dir = await mkdtemp(join(tmpdir(), "wendo-fetch-"));
    const outputPath = join(dir, "page.json");
    const args = [
      SCRIPT_PATH,
      options.url,
      outputPath,
      "--timeout",
      String(timeoutSeconds),
      "--max-chars",
      String(maxChars),
    ];

    try {
      await execFileAsync(python, args, {
        timeout: (timeoutSeconds + 15) * 1000,
        maxBuffer: 4 * 1024 * 1024,
        windowsHide: true,
      });
    } catch (error) {
      const err = error as NodeJS.ErrnoException & { stderr?: string; killed?: boolean };
      if (err.code === "ENOENT") {
        throw new FetchPageError(
          "python_missing",
          `找不到 Python 解释器 "${python}"。请安装 Python 3.11+ 与 requirements.txt 中的 Scrapling。`,
        );
      }
      if (err.killed) {
        throw new FetchPageError("fetch_timeout", `抓取超时（${timeoutSeconds + 15}s）：${options.url}`);
      }
      const parsed = parseScraplingError(err.stderr ?? "");
      if (parsed) {
        throw new FetchPageError(parsed.code, parsed.message);
      }
      throw new FetchPageError(
        "fetch_failed",
        `Scrapling 抓取失败：${(err.stderr ?? err.message ?? "").trim().slice(0, 500)}`,
      );
    }

    const raw = await readFile(outputPath, "utf8");
    const payload = JSON.parse(raw) as {
      url: string;
      final_url: string;
      status: number;
      title: string;
      text: string;
      char_count: number;
      fetched_at: string;
      elapsed_ms: number;
      fetcher: string;
    };
    const page: FetchedPage = {
      url: payload.url,
      finalUrl: payload.final_url,
      status: payload.status,
      title: payload.title,
      text: payload.text,
      charCount: payload.char_count,
      fetchedAt: payload.fetched_at,
      elapsedMs: payload.elapsed_ms,
      fetcher: payload.fetcher,
    };
    if (!page.text || page.text.trim().length < 40) {
      throw new FetchPageError("empty_content", "抓取结果正文过短，已中止，不生成空报告。");
    }
    return page;
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true });
  }
}
