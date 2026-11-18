/**
 * 合规规则跑真实页面：抓页面 → 跑 `analyzeCompliance` → 打印 finding 表 + 落一份 JSON。
 *
 * 用法：
 *   npx tsx scripts/run-compliance.ts --url <页面> --category small_appliances
 *   npx tsx scripts/run-compliance.ts --text-file <可见文本> --category consumer_electronics
 *
 * 只跑代码侧判定，不调用模型，所以同一页两次结果完全一致；输出不含分数。
 */

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchPage } from "../src/tools/fetch-page.js";
import { analyzeCompliance, complianceDimension, complianceSummary } from "../src/compliance/analyze.js";

interface Args {
  url?: string;
  textFile?: string;
  category: string;
  out?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { category: "small_appliances" };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!value) continue;
    if (flag === "--url") args.url = value;
    else if (flag === "--text-file") args.textFile = value;
    else if (flag === "--category") args.category = value;
    else if (flag === "--out") args.out = value;
    else continue;
    index += 1;
  }
  if (!args.url && !args.textFile) {
    throw new Error("需要 --url 或 --text-file 之一");
  }
  return args;
}

const root = fileURLToPath(new URL("..", import.meta.url));

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const page = args.url
    ? await fetchPage({ url: args.url, interface: false })
    : {
        url: args.textFile!,
        finalUrl: args.textFile!,
        title: args.textFile!,
        text: await readFile(args.textFile!, "utf8"),
        charCount: 0,
      };

  const analysis = analyzeCompliance({
    text: page.text,
    category: args.category,
    title: page.title,
    url: page.finalUrl,
  });

  console.log(`\n页面：${page.finalUrl}`);
  console.log(`品类：${args.category} · 正文 ${page.text.length} 字符 · 规则库 ${analysis.libraryVersion}`);
  console.log(complianceSummary(analysis));
  console.log(complianceDimension(analysis).note);
  console.log("\n| # | 规则 | 判定 | 严重度 | 法条 | 原文 |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  analysis.findings.forEach((item, index) => {
    const quote = item.quote.replace(/\|/g, "\\|").slice(0, 90);
    console.log(
      `| ${index + 1} | ${item.ruleId} | ${item.decisionLevel} | ${item.severity} | ${item.lawShort} ${item.article} | ${quote} |`,
    );
  });

  const skipped = analysis.dispositions.filter((item) => item.outcome !== "finding");
  console.log(`\n未进报告的规则：${skipped.length} 条`);
  for (const item of skipped) {
    console.log(`  - ${item.ruleId} (${item.decisionLevel}) ${item.outcome}：${item.reason ?? ""}`);
  }

  const slug = (page.finalUrl || "page")
    .replace(/^https?:\/\//, "")
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 80);
  const outPath = args.out ?? join(root, "reports", "compliance", `${slug}.json`);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    `${JSON.stringify(
      {
        url: page.finalUrl,
        title: page.title,
        category: args.category,
        ran_at: new Date().toISOString(),
        rules_version: analysis.libraryVersion,
        counts: analysis.counts,
        findings: analysis.findings,
        dispositions: analysis.dispositions,
        boundary: analysis.boundaryNote,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`\n已写入 ${outPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
