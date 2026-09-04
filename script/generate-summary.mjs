/**
 * 自动为博客文章生成 AI 摘要
 *
 * 用法：
 *   pnpm summary                # 仅为缺少 summary 的文章生成
 *   pnpm summary --force        # 重新生成所有文章
 *   pnpm summary --soft         # dev/build 前置步骤：静默生成，失败不阻塞运行
 *
 * 说明：
 *   --soft 模式下若检测不到 API Key 会直接跳过（避免 CI/dev 空转网络请求）。
 *   main() 仅在被当作脚本直接执行时运行，被 import（如单元测试）时不产生副作用。
 *
 * 默认使用 DeepSeek 的 Anthropic 兼容端点，可通过环境变量覆盖：
 *   ANTHROPIC_BASE_URL   接口地址（默认 https://api.deepseek.com/anthropic）
 *   ANTHROPIC_MODEL      模型名（默认 deepseek-v4-flash）
 *   DEEPSEEK_API_KEY     DeepSeek API Key（优先）
 *   ANTHROPIC_API_KEY    Anthropic API Key（用于官方端点）
 *   ANTHROPIC_AUTH_TOKEN Bearer Token（优先于以上两者时使用）
 */
import { promises as fs } from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, "../src/content/blog");
const DEEPSEEK_BASE = "https://api.deepseek.com/anthropic";

// frontmatter 块：开头的 --- 与结尾的 ---（允许末尾换行缺失）
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const ts = () => new Date().toISOString();
/** --soft 模式：作为 dev/build 前置步骤静默运行，失败不阻塞、失败不 exit(1) */
const SOFT = process.argv.includes("--soft");
const debug = (...args) => {
  if (!SOFT) console.log(`[DEBUG] ${ts()}`, ...args);
};

/** 是否配置了可用的 API Key（--soft 模式下据此决定是否提前跳过） */
const hasCredentials = () =>
  Boolean(
    process.env.DEEPSEEK_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_AUTH_TOKEN
  );

// ============ 纯函数（可测试） ============

/** 解析 frontmatter，返回 { fmBody, hasSummary }，无 frontmatter 返回 null */
export const parseFrontmatter = (raw) => {
  const m = raw.match(FM_RE);
  if (!m) return null;
  return {
    fmBody: m[1],
    hasSummary: /^summary:/m.test(m[1]),
  };
};

/** YAML 双引号字符串转义（单行、处理反斜杠与引号） */
export const yamlQuote = (value) => {
  const cleaned = String(value).replace(/[\r\n]+/g, " ").trim();
  return `"${cleaned.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
};

/** 在 frontmatter 中插入或替换 summary 行 */
export const upsertSummary = (fmBody, summary) => {
  const line = `summary: ${yamlQuote(summary)}`;
  return /^summary:/m.test(fmBody)
    ? fmBody.replace(/^summary:.*$/m, line)
    : `${fmBody}\n${line}`;
};

/** 清洗模型输出的摘要：去引号/前缀、压缩空白、限长 */
export const cleanSummary = (raw) => {
  let s = String(raw).trim();
  s = s.replace(/^["'“”「『]+|["'“”」』]+$/g, "").trim();
  s = s.replace(/^(摘要|总结|文章总结|简介)\s*[:：]\s*/, "");
  s = s.replace(/\s+/g, " ");
  if (s.length > 120) s = `${s.slice(0, 120)}…`;
  return s;
};

/** 提取正文纯文本（剥离 frontmatter 与 markdown 语法），截断控制 token 用量 */
export const getBodyText = (raw) => {
  const m = raw.match(FM_RE);
  const body = m ? raw.slice(m[0].length) : raw;
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*|`~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
};

/** 递归收集目录下所有 .md / .mdx 文件 */
export const listMarkdown = async (dir) => {
  const result = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await listMarkdown(full)));
    else if (/\.(md|mdx)$/.test(entry.name)) result.push(full);
  }
  return result.sort();
};

/** 写回 summary 到 frontmatter */
export const writeSummaryBack = (raw, summary) => {
  const m = raw.match(FM_RE);
  if (!m) throw new Error("frontmatter 缺失，无法写入 summary");
  return `---\n${upsertSummary(m[1], summary)}\n---\n${raw.slice(m[0].length)}`;
};

// ============ AI 调用 ============

const buildClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!apiKey && !authToken) {
    debug(
      "未设置 DEEPSEEK_API_KEY / ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN，将尝试 SDK 默认凭据（如 ant auth login）"
    );
  }
  return new Anthropic({
    baseURL: process.env.ANTHROPIC_BASE_URL || DEEPSEEK_BASE,
    ...(apiKey ? { apiKey } : {}),
    ...(authToken ? { authToken } : {}),
  });
};

const SYSTEM_PROMPT = [
  "你是一名博客文章摘要助手。",
  "请为给定的博客文章生成一段简短、准确、吸引人的中文摘要。",
  "要求：2~3 句话，不超过 100 字；用第三人称客观概括；",
  "不要任何前缀、引号、列表或额外解释；只输出摘要正文。",
].join("");

const generateSummary = async (client, body) => {
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "deepseek-v4-flash",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `博客文章内容：\n\n${body}` }],
  });
  if (response.stop_reason === "refusal") {
    throw new Error(`模型拒绝生成：${response.stop_details?.category ?? "未知原因"}`);
  }
  const text = (response.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  const summary = cleanSummary(text);
  if (!summary) throw new Error("模型返回了空摘要");
  return summary;
};

// ============ 主流程 ============

const main = async () => {
  const force = process.argv.includes("--force");
  const files = await listMarkdown(BLOG_DIR);
  debug(`扫描到 ${files.length} 篇 Markdown 文章，force=${force}`);

  const pending = [];
  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const raw = await fs.readFile(file, "utf8");
    const fm = parseFrontmatter(raw);
    if (!fm) {
      debug(`跳过（无 frontmatter）: ${rel}`);
      continue;
    }
    if (fm.hasSummary && !force) {
      debug(`跳过（已有 summary）: ${rel}`);
      continue;
    }
    const body = getBodyText(raw);
    if (body.length < 20) {
      debug(`跳过（正文过短）: ${rel}`);
      continue;
    }
    pending.push({ file, rel, raw, body });
  }

  if (!pending.length) {
    if (!SOFT) console.log("🎉 所有文章都已有 summary，无需生成（使用 --force 强制重新生成）");
    return;
  }

  // --soft（dev/build 前置）下无 API Key 时提前跳过，避免在 CI/调试时反复空转网络请求
  if (SOFT && !hasCredentials()) {
    console.warn(
      `⚠️ ${pending.length} 篇缺少 summary，但未检测到 API Key，已跳过（--soft 不阻塞运行，可手动 pnpm summary 生成）`
    );
    return;
  }

  debug(`待生成 ${pending.length} 篇`);
  const client = buildClient();
  const ok = [];
  const fail = [];

  for (const { file, rel, raw, body } of pending) {
    try {
      debug(`生成中（${body.length} 字符正文）: ${rel}`);
      const summary = await generateSummary(client, body);
      await fs.writeFile(file, writeSummaryBack(raw, summary), "utf8");
      ok.push(rel);
      console.log(`✅ ${rel}\n   ↳ ${summary}`);
    } catch (err) {
      fail.push({ rel, err });
      console.error(`❌ ${rel}: ${err.message}`);
      if (process.env.DEBUG === "1") console.error(err);
    }
  }

  console.log("\n===== 汇总 =====");
  console.log(`成功: ${ok.length} 篇 | 失败: ${fail.length} 篇`);
  if (fail.length) {
    for (const { rel, err } of fail) console.error(`  - ${rel}: ${err.message}`);
    if (!SOFT) process.exit(1);
  }
};

// 仅当被当作脚本直接执行时才运行主流程；
// 被 import（如 generate-summary.test.mjs 导入纯函数）时不产生任何副作用，避免误触发 AI 调用
const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error("❌ 脚本异常退出:", err);
    process.exit(1);
  });
}
