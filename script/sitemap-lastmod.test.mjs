import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatterLastmod, getArticleLastmods, getListingLastmods } from "./sitemap-lastmod.mjs";

test("parseFrontmatterLastmod：无 updated 时以 date 作为 lastmod", () => {
  const raw = `---
title: "测试文章"
id: "abc123"
date: 2025-12-09 20:30:42
---

正文`;
  assert.deepEqual(parseFrontmatterLastmod(raw), {
    id: "abc123",
    lastmod: new Date("2025-12-09T20:30:42Z").toISOString(),
  });
});

test("parseFrontmatterLastmod：有 updated 时优先取 updated", () => {
  const raw = `---
title: "测试文章"
id: "abc123"
date: 2025-12-09 20:30:42
updated: 2026-01-02 10:00:00
---

正文`;
  assert.deepEqual(parseFrontmatterLastmod(raw), {
    id: "abc123",
    lastmod: new Date("2026-01-02T10:00:00Z").toISOString(),
  });
});

test("parseFrontmatterLastmod：兼容不抱引号的 id，纯日期按 UTC 零点", () => {
  const raw = `---
id: 3d9f55037a84f360
date: 2025-12-09
---

正文`;
  assert.deepEqual(parseFrontmatterLastmod(raw), {
    id: "3d9f55037a84f360",
    lastmod: "2025-12-09T00:00:00.000Z",
  });
});

test("parseFrontmatterLastmod：已带时区偏移的 ISO 时间按原偏移解析", () => {
  const raw = `---
id: "abc123"
date: 2026-01-01T00:00:00
updated: 2026-01-02T08:00:00+08:00
---

正文`;
  assert.equal(
    parseFrontmatterLastmod(raw).lastmod,
    new Date("2026-01-02T00:00:00Z").toISOString(),
  );
});

test("parseFrontmatterLastmod：缺 id 或缺 date 返回 null", () => {
  assert.equal(
    parseFrontmatterLastmod(`---
date: 2025-12-09
---

正文`),
    null,
  );
  assert.equal(
    parseFrontmatterLastmod(`---
id: "abc123"
---

正文`),
    null,
  );
});

test("parseFrontmatterLastmod：无 frontmatter 或日期非法返回 null", () => {
  assert.equal(parseFrontmatterLastmod("# 只有正文"), null);
  assert.equal(
    parseFrontmatterLastmod(`---
id: "abc123"
date: 不是日期
---

正文`),
    null,
  );
});

test("getArticleLastmods：扫描目录建立 id -> lastmod 映射，含草稿", () => {
  const index = getArticleLastmods(new URL("./__fixtures__/", import.meta.url));
  assert.deepEqual(
    [...index.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    [
      ["draft-01", new Date("2026-02-01T09:00:00Z").toISOString()],
      ["hidden-01", new Date("2026-04-05T10:00:00Z").toISOString()],
      ["post-01", new Date("2026-01-15T12:00:00Z").toISOString()],
      ["post-02", new Date("2026-03-01T08:30:00Z").toISOString()],
    ],
  );
});

test("getListingLastmods：首页取已发布且未隐藏文章的最新更新", () => {
  const index = getListingLastmods(new URL("./__fixtures__/", import.meta.url));
  assert.equal(
    index.get("/"),
    new Date("2026-03-01T08:30:00Z").toISOString(),
  );
});

test("getListingLastmods：归档/分类索引/标签索引取全部已发布文章（含隐藏）的最新更新", () => {
  const index = getListingLastmods(new URL("./__fixtures__/", import.meta.url));
  for (const rel of ["/archives", "/categories", "/tags"]) {
    assert.equal(index.get(rel), new Date("2026-04-05T10:00:00Z").toISOString(), rel);
  }
});

test("getListingLastmods：分类页/标签页按各自文章集合取最新更新，排除草稿", () => {
  const index = getListingLastmods(new URL("./__fixtures__/", import.meta.url));
  assert.equal(index.get("/categories/cat-a"), new Date("2026-01-15T12:00:00Z").toISOString());
  assert.equal(index.get("/categories/cat-b"), new Date("2026-04-05T10:00:00Z").toISOString());
  assert.equal(index.get("/tags/t1"), new Date("2026-03-01T08:30:00Z").toISOString());
  assert.equal(index.get("/tags/t2"), new Date("2026-04-05T10:00:00Z").toISOString());
});
