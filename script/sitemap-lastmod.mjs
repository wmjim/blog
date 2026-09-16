import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 与 content.config.ts 的 glob loader 保持一致：src/content/blog 下全部 md/mdx
const POSTS_DIR = path.resolve(__dirname, "../src/content/blog");

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
// 仅提取 lastmod 所需字段，避免引入完整 YAML 解析依赖
const FIELD_RE = /^([a-zA-Z_]+):\s*(.*)$/;
const LIST_ITEM_RE = /^\s*-\s+(.+?)\s*$/;

/** YAML 1.2 时间戳核心 schema：不带时区偏移的时间戳一律按 UTC 解释 */
const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2})([ T]\d{2}:\d{2}(:\d{2})?)?$/;

/** 去掉 YAML 标量两侧可选的引号 */
const unquote = (value) => value.replace(/^["']|["']$/g, "");

/** 去掉行内注释（仅对未加引号的标量安全） */
const stripComment = (value) =>
  /^["']/.test(value) ? value : value.split(/\s+#/)[0];

const asBool = (value) => value === "true";

/** 把 frontmatter 中的日期字符串转成 UTC Date。
 *  无时区的时间戳按 UTC 处理，使 lastmod 不受构建机器时区影响，
 *  与内容层（astro:content）/ RSS 的口径保持一致。 */
const parseStamp = (value) => {
  const t = TIMESTAMP_RE.exec(value);
  if (t) return new Date(`${t[1]}${t[2] ? `${t[2].replace(" ", "T")}Z` : ""}`);
  // 其他格式（如已带时区偏移或 ISO8601）按原生规则解析
  return new Date(value);
};

/**
 * 轻量解析 frontmatter，仅产出 lastmod 计算所需的形状（字符串/布尔/字符串数组）。
 * 不覆盖 YAML 全集，够用且不引入解析依赖。
 */
const parseFrontmatter = (fmBody) => {
  const lines = fmBody.split(/\r?\n/);
  const fields = {};
  for (let i = 0; i < lines.length; i++) {
    const m = FIELD_RE.exec(lines[i]);
    if (!m) continue;
    const key = m[1];
    let value = stripComment(m[2].trim());

    if (value === "") {
      // 块序列：后续缩进的 `- item` 行归入该字段
      const items = [];
      while (i + 1 < lines.length && LIST_ITEM_RE.test(lines[i + 1])) {
        i++;
        items.push(unquote(LIST_ITEM_RE.exec(lines[i])[1]));
      }
      fields[key] = items;
      continue;
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      // 流序列：[a, b]
      fields[key] = value
        .slice(1, -1)
        .split(",")
        .map((item) => unquote(item.trim()))
        .filter(Boolean);
      continue;
    }
    fields[key] = unquote(value);
  }
  return fields;
};

/** 从单篇 Markdown 提取 lastmod 计算所需的字段；无 frontmatter 返回 null */
const parsePost = (raw) => {
  const fm = FM_RE.exec(raw);
  if (!fm) return null;
  const f = parseFrontmatter(fm[1]);
  const { id, date, updated, categories, tags, draft, hide, top } = f;
  if (!id || !date) return null;

  const stamp = parseStamp(updated ?? date);
  if (Number.isNaN(stamp.getTime())) return null;

  return {
    id: String(id),
    lastmod: stamp.toISOString(),
    date: stamp.getTime(),
    categories: categories === undefined ? undefined : String(categories),
    tags: Array.isArray(tags) ? tags.map(String) : [],
    draft: asBool(draft),
    hide: asBool(hide),
    top: asBool(top),
  };
};

/**
 * 从单篇 Markdown 原文中提取 id 与 lastmod（updated 优先，回退 date）。
 * 缺 id/date、无 frontmatter 或日期非法时返回 null。
 */
export const parseFrontmatterLastmod = (raw) => {
  const post = parsePost(raw);
  return post ? { id: post.id, lastmod: post.lastmod } : null;
};

/** 递归收集目录下的 Markdown 文件 */
const walkMarkdown = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
};

const scanPosts = (dir) =>
  walkMarkdown(dir instanceof URL ? fileURLToPath(dir) : dir)
    .map((file) => parsePost(fs.readFileSync(file, "utf8")))
    .filter(Boolean);

/**
 * 建立 文章 id -> lastmod 的映射，供 astro.config 的 sitemap serialize 使用。
 * 含草稿：草稿页在生产构建中不存在，多出的条目不会被 serialize 命中。
 */
export const getArticleLastmods = (dir = POSTS_DIR) =>
  new Map(scanPosts(dir).map((post) => [post.id, post.lastmod]));

// 与 src/pages/[...page].astro 的首页分页口径一致
const PAGE_SIZE = 15;

// 置顶文章仅取首篇提前，其余保持日期倒序（对齐 moveTopToFirst）
const moveTopToFirst = (posts) => {
  const i = posts.findIndex((post) => post.top);
  if (i !== -1) {
    const [top] = posts.splice(i, 1);
    posts.unshift(top);
  }
  return posts;
};

const byDateDesc = (a, b) => b.date - a.date;

/** ISO 时间戳字典序即时间序，直接取最大值即为最新更新 */
const latest = (posts) => (posts.length ? posts.map((p) => p.lastmod).sort().pop() : undefined);

/**
 * 建立列表页相对路径 -> lastmod 的映射，口径对齐各列表页实际渲染的文章范围：
 *  首页分页（含 /、/2…）排除草稿与隐藏文章并按首页排序分页；
 *  归档/分类索引/标签索引取全部已发布文章的最新更新；
 *  分类页/标签页取该分类或标签下已发布文章（含隐藏文章，页面本身展示它们）的最新更新。
 * 键为去掉 base 的解码路径，serialize 侧同样解码后匹配。
 */
export const getListingLastmods = (dir = POSTS_DIR) => {
  const index = new Map();
  const set = (rel, posts) => {
    const lastmod = latest(posts);
    if (lastmod) index.set(rel, lastmod);
  };

  const published = scanPosts(dir).filter((post) => !post.draft);

  const home = moveTopToFirst(published.filter((post) => !post.hide).sort(byDateDesc));
  const pages = Math.max(1, Math.ceil(home.length / PAGE_SIZE));
  for (let i = 0; i < pages; i++) {
    set(i === 0 ? "/" : `/${i + 1}`, home.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE));
  }

  set("/archives", published);
  set("/categories", published);
  set("/tags", published);

  for (const name of new Set(published.map((post) => post.categories).filter(Boolean))) {
    set(`/categories/${name}`, published.filter((post) => post.categories === name));
  }
  for (const name of new Set(published.flatMap((post) => post.tags))) {
    set(`/tags/${name}`, published.filter((post) => post.tags.includes(name)));
  }

  return index;
};
