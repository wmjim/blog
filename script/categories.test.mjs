import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.resolve("src/content");

// 仅扫描 frontmatter 取出 categories，避免依赖 astro:content（node --test 环境无 Astro 运行时）
function collectCategories(root) {
	const out = [];
	const walk = (dir) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, entry.name);
			if (entry.isDirectory()) walk(p);
			else if (/\.(md|mdx)$/.test(entry.name)) {
				const fm = fs.readFileSync(p, "utf8").match(/^---([\s\S]*?)^---/m);
				if (!fm) continue;
				const hit = fm[1].match(/^categories:\s*(.+?)\s*$/m);
				if (hit) out.push({ file: path.relative(process.cwd(), p), categories: hit[1].replace(/^["']|["']$/g, "") });
			}
		}
	};
	walk(root);
	return out;
}

test("分类名不存在仅大小写不同的冲突：否则会生成两个近乎重复的页面，并在大小写不敏感的文件系统上触发路由冲突", () => {
	const items = collectCategories(CONTENT_ROOT);
	assert.ok(items.length > 0, "未扫描到任何 categories，检查 CONTENT_ROOT 是否正确");

	const byKey = new Map();
	for (const { file, categories } of items) {
		const key = categories.toLowerCase();
		if (!byKey.has(key)) byKey.set(key, []);
		byKey.get(key).push({ file, categories });
	}

	const conflicts = [...byKey.values()].filter((group) => {
		const names = new Set(group.map((i) => i.categories));
		return names.size > 1;
	});

	assert.equal(conflicts.length, 0, conflicts.map((g) => g.map((i) => `${i.categories}（${i.file}）`).join(" 对 ")).join("\n"));
});
