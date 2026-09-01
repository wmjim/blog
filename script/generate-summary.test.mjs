import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseFrontmatter,
  yamlQuote,
  upsertSummary,
  cleanSummary,
  getBodyText,
  writeSummaryBack,
} from "./generate-summary.mjs";

const SAMPLE = `---
title: "测试文章"
categories: linux
id: "abc123"
date: 2026-06-28 07:18:34
---

正文第一句。

## 章节

正文第二句。`;

test("yamlQuote 转义双引号与反斜杠", () => {
  assert.equal(yamlQuote('他说 "你好" \\ ok'), '"他说 \\"你好\\" \\\\ ok"');
});

test("yamlQuote 折叠换行为空格并去除首尾空白", () => {
  assert.equal(yamlQuote("  第一行\n第二行  "), '"第一行 第二行"');
});

test("parseFrontmatter 正确识别有无 summary", () => {
  assert.equal(parseFrontmatter(SAMPLE).hasSummary, false);
  assert.equal(
    parseFrontmatter(SAMPLE.replace("---\n", '---\nsummary: "已有"\n')).hasSummary,
    true
  );
  assert.equal(parseFrontmatter("没有 frontmatter 的纯文本"), null);
});

test("upsertSummary 无 summary 时在末尾追加", () => {
  const fmBody = parseFrontmatter(SAMPLE).fmBody;
  const next = upsertSummary(fmBody, "这是一段摘要");
  assert.match(next, /\nsummary: "这是一段摘要"$/);
});

test("upsertSummary 已有 summary 时替换原行", () => {
  const withOld = SAMPLE.replace(
    "---\n",
    '---\nsummary: "旧摘要"\n'
  );
  const fmBody = parseFrontmatter(withOld).fmBody;
  const next = upsertSummary(fmBody, "新摘要");
  assert.equal((next.match(/^summary:.*$/m) || [])[0], 'summary: "新摘要"');
  assert.equal((next.match(/^summary:.*$/gm) || []).length, 1);
});

test("writeSummaryBack 保留其余 frontmatter 与正文", () => {
  const out = writeSummaryBack(SAMPLE, "生成的摘要");
  assert.match(out, /^---\n/);
  assert.match(out, /\nsummary: "生成的摘要"\n---\n/);
  assert.match(out, /正文第一句/);
  assert.equal(out.includes("旧摘要"), false);
});

test("cleanSummary 去除引号、前缀并压缩空白", () => {
  assert.equal(cleanSummary('"这是一段摘要"'), "这是一段摘要");
  assert.equal(cleanSummary("摘要：这是正文。"), "这是正文。");
  assert.equal(cleanSummary("多  个\n\n空白"), "多 个 空白");
  assert.equal(cleanSummary("「标签前缀」核心内容"), "标签前缀」核心内容");
});

test("cleanSummary 超长时截断到 120 字", () => {
  const long = "长".repeat(200);
  const out = cleanSummary(long);
  assert.ok(out.length <= 121);
  assert.equal(out.endsWith("…"), true);
});

test("getBodyText 剥离 frontmatter 与 markdown 语法", () => {
  const text = getBodyText(SAMPLE);
  assert.equal(text.includes("title"), false);
  assert.equal(text.includes("正文第一句"), true);
  assert.equal(text.includes("章节"), true);
});
