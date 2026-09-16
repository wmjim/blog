/**
 * 字体子集脚本：扫描全站用字，用 subset-font 生成紧致子集 woff2（替代整字库 unicode-range 分片）。
 *
 * 用法：
 *   FONTSRC=/path/to/ttfs node script/split-fonts.mjs
 *   # 默认从 ~/Archive/Fonts/ 读取源字体（避免 /tmp 重启被清理），输出到 public/fonts/
 *
 * 源字体来源（SIL OFL 协议，可自由自托管）：
 *   - LXGW WenKai Screen v1.522（静态常规字重，官方仅发布 Regular；正文加粗由浏览器合成）
 *     https://github.com/lxgw/LxgwWenKai-Screen/releases/download/v1.522/LXGWWenKaiScreen.ttf
 *   - Maple Mono CN v7.9（静态字重 TTF，取 Regular；斜体不生成——Shiki github 双主题不产生斜体 token）
 *     https://github.com/subframe7536/maple-font/releases/download/v7.9/MapleMono-CN.zip
 *   - Noto Serif SC（变量字体，wght 钉到 600 供文章标题使用）
 *     https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf
 *
 * 产物：每个字重生成 result.css + 1 个紧致 woff2（全站约 1000 个用字，首访字体下载从 ~1.6MB 降至 ~300KB）。
 * 说明：曾尝试 cn-font-split 的 subsets 入参，但其 v7 手动分包控制已失效（见其 v6 迁移指南），故改用 subset-font。
 */
import subsetFont from 'subset-font';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const FONT_SRC = process.env.FONTSRC || path.join(os.homedir(), 'Archive/Fonts');
const OUT_ROOT = path.resolve('public/fonts');
const SRC_ROOT = path.resolve('src');

// 收集全站渲染用字：LXGW 作用于 body、Maple 作用于代码，均需覆盖文章正文 + UI 文案。
// 从源码收集（.md/.astro/.ts 含注释也在内，过度收集无害，漏收才致命），再补基础字符集。
function collectChars() {
	const chars = new Set();
	// 基础集：ASCII 可打印 + 常用标点（CJK/全角/通用/Latin-1），保证英文、数字、符号不缺字
	const addRange = (lo, hi) => { for (let c = lo; c <= hi; c++) chars.add(c); };
	addRange(0x20, 0x7e);   // ASCII 可打印
	addRange(0x3000, 0x303f); // CJK 标点
	addRange(0xff00, 0xffef); // 全角形式
	addRange(0x2000, 0x206f); // 通用标点
	addRange(0x00a0, 0x00ff); // Latin-1 补充（货币、重音等）
	// 构建/运行期由 dayjs zh-cn 等生成的文案（如日期「下午/晚上」），源码中不存在，需显式补充
	for (const ch of '凌晨早上中午下午晚上星期一二三四五六日月年内前几秒分钟小时天个点分') chars.add(ch.codePointAt(0));

	const walk = (dir) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			if (entry.name === 'node_modules') continue;
			const p = path.join(dir, entry.name);
			if (entry.isDirectory()) walk(p);
			else if (/\.(md|astro|ts|less|mjs|json)$/.test(entry.name)) {
				const text = fs.readFileSync(p, 'utf8');
				for (const ch of text) chars.add(ch.codePointAt(0));
			}
		}
	};
	walk(SRC_ROOT);
	return [...chars].sort((a, b) => a - b).map((c) => String.fromCodePoint(c)).join('');
}

// 待子集化变体：源文件 → 输出目录 / CSS 声明 / 变量轴处理
const VARIANTS = [
	{
		src: path.join(FONT_SRC, 'LXGWWenKaiScreen.ttf'),
		out: path.join(OUT_ROOT, 'lxgw-wenkai-screen/regular'),
		css: { fontFamily: 'LXGW WenKai Screen', fontWeight: '400', fontStyle: 'normal' },
	},
	{
		src: path.join(FONT_SRC, 'MapleMono-CN-Regular.ttf'),
		out: path.join(OUT_ROOT, 'maple-mono-cn/regular'),
		css: { fontFamily: 'Maple Mono CN', fontWeight: '400', fontStyle: 'normal' },
	},
	{
		// 文章 h1–h6 的衬线标题字体。标题仅用 600 字重，把 wght 轴钉到 600：
		// 去掉 gvar 变量差值后体积约为保留整条轴的一半，且不再需要 @fontsource 整包的 102 个 unicode-range 分片
		src: path.join(FONT_SRC, 'NotoSerifSC[wght].ttf'),
		out: path.join(OUT_ROOT, 'noto-serif-sc/semibold'),
		css: { fontFamily: 'Noto Serif SC', fontWeight: '600', fontStyle: 'normal' },
		variationAxes: { wght: 600 },
	},
];

const charset = collectChars();
console.log(`[CHARS] 收集到 ${charset.length} 个字符`);

// 作为 pnpm prebuild 钩子运行：CI 等无源字体的环境自动跳过，沿用已提交的 public/fonts
if (!VARIANTS.some((v) => fs.existsSync(v.src))) {
	console.log('[SKIP] 源字体目录缺失，跳过子集生成（使用已提交的 public/fonts）');
	process.exit(0);
}

for (const v of VARIANTS) {
	if (!fs.existsSync(v.src)) {
		console.error(`[SKIP] 源字体不存在: ${v.src}`);
		continue;
	}
	fs.rmSync(v.out, { recursive: true, force: true });
	fs.mkdirSync(v.out, { recursive: true });
	const ttf = new Uint8Array(fs.readFileSync(v.src).buffer);
	console.log(`[SUBSET] ${path.basename(v.src)} -> ${v.out}`);
	const t0 = Date.now();
	const woff2 = await subsetFont(Buffer.from(ttf), charset, {
		targetFormat: 'woff2',
		// 变体可通过 variationAxes 把变量轴钉到单一位置（变体为静态字体时忽略）
		variationAxes: v.variationAxes,
	});
	const woff2Name = 'subset.woff2';
	fs.writeFileSync(path.join(v.out, woff2Name), woff2);
	const css = `@font-face{font-family:"${v.css.fontFamily}";src:local("${v.css.fontFamily}"),url("./${woff2Name}")format("woff2");font-style:${v.css.fontStyle};font-display:swap;font-weight:${v.css.fontWeight}}`;
	fs.writeFileSync(path.join(v.out, 'result.css'), css);
	console.log(`[DONE] ${(woff2.length / 1024).toFixed(0)}KB woff2, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

// 分片 CSS 由 src/components/Head/Head.astro 直接以 <link> 输出（避免 @import 串行），此处不再生成 index.css 入口

process.exit(0);
