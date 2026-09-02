/**
 * 字体分片脚本：用 cn-font-split 把自托管 CJK 字体按 unicode-range 切成 woff2 分片。
 *
 * 用法：
 *   FONTSRC=/path/to/ttfs node script/split-fonts.mjs
 *   # 默认从 /tmp/fontsrc/ 读取源字体，输出到 public/fonts/
 *
 * 源字体来源（SIL OFL 协议，可自由自托管）：
 *   - LXGW WenKai Screen v1.522（静态常规字重，官方仅发布 Regular；正文加粗由浏览器合成）
 *     https://github.com/lxgw/LxgwWenKai-Screen/releases/download/v1.522/LXGWWenKaiScreen.ttf
 *   - Maple Mono CN v7.9（静态字重 TTF，取 Regular / Italic）
 *     https://github.com/subframe7536/maple-font/releases/download/v7.9/MapleMono-CN.zip
 *
 * 产物：每个字重生成 result.css + 若干 .woff2 分片（浏览器只按需下载命中 unicode-range 的分片）。
 */
import { fontSplit } from 'cn-font-split';
import fs from 'node:fs';
import path from 'node:path';

const FONT_SRC = process.env.FONTSRC || '/tmp/fontsrc';
const OUT_ROOT = path.resolve('public/fonts');

// 四个待分片变体：源文件 → 输出目录 / CSS 声明
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
		src: path.join(FONT_SRC, 'MapleMono-CN-Italic.ttf'),
		out: path.join(OUT_ROOT, 'maple-mono-cn/italic'),
		css: { fontFamily: 'Maple Mono CN', fontWeight: '400', fontStyle: 'italic' },
	},
];

for (const v of VARIANTS) {
	if (!fs.existsSync(v.src)) {
		console.error(`[SKIP] 源字体不存在: ${v.src}`);
		continue;
	}
	fs.rmSync(v.out, { recursive: true, force: true });
	fs.mkdirSync(v.out, { recursive: true });
	const buf = new Uint8Array(fs.readFileSync(v.src).buffer);
	console.log(`[SPLIT] ${path.basename(v.src)} -> ${v.out} (${v.css.fontWeight} ${v.css.fontStyle || 'normal'})`);
	const t0 = Date.now();
	await fontSplit({
		input: buf,
		outDir: v.out,
		silent: true,
		testHtml: false,
		reporter: false,
		previewImage: false,
		css: { ...v.css, fontDisplay: 'swap' },
	});
	const files = fs.readdirSync(v.out).filter((f) => f.endsWith('.woff2'));
	console.log(`[DONE] ${files.length} 分片, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

// 分片 CSS 由 src/components/Head/Head.astro 直接以 <link> 输出（避免 @import 串行），此处不再生成 index.css 入口

process.exit(0);
