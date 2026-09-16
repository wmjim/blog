import path from "path";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import Compress from "@playform/compress";
import Compressor from "astro-compressor";
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Markdown 配置================
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import { remarkNote, addClassNames, rehypeGithubCallout } from './src/plugins/markdown.custom'
import { unified } from '@astrojs/markdown-remark'
import remarkMermaid from './src/plugins/remarkMermaid'
// Markdown 配置================
import SITE_INFO from './src/config';
import swup from '@swup/astro';
import { getArticleLastmods, getListingLastmods } from './script/sitemap-lastmod.mjs';
// 文章 id -> lastmod（updated ?? date），供 sitemap serialize 填充 <lastmod>
const LASTMODS = getArticleLastmods();
// 列表页相对路径 -> lastmod，供 sitemap serialize 填充 <lastmod>
const LISTING_LASTMODS = getListingLastmods();
// 站点部署子路径，serialize 据此把绝对 url 折算成列表页查表用的相对路径
const BASE = '/blog';
// https://astro.build/config
export default defineConfig({
	site: SITE_INFO.Site,
	base: `${BASE}/`,
	build: { assets: 'vh_static' },
	integrations: [swup({
		theme: false,
		animationClass: "vh-animation-",
		containers: [".main-inner", '.vh-header>.main'],
		smoothScrolling: true,
		progress: true,
		cache: true,
		preload: true,
		accessibility: true,
		updateHead: true,
		updateBodyClass: false,
		globalInstance: true
	}),
	Compress({ Image: false }),
	sitemap({
		// 处理末尾带 / 的 url；文章页与列表页补 lastmod（updated ?? date）供爬虫增量抓取
		serialize: (item) => {
			const url = item.url.endsWith('/') ? item.url.slice(0, -1) : item.url;
			const hit = url.match(/\/article\/([^/]+)$/);
			// 列表页路径含中文等字符时会被百分号编码，两侧统一解码后再匹配
			const rel = decodeURIComponent(new URL(url).pathname);
			const key = rel === BASE ? '/' : rel.startsWith(`${BASE}/`) ? rel.slice(BASE.length) : rel;
			const lastmod = (hit && LASTMODS.get(hit[1])) || LISTING_LASTMODS.get(key);
			return { ...item, url, lastmod: lastmod ?? item.lastmod };
		}
	}),
	// 继承 markdown 配置，.mdx 才能复用 unified 管线（KaTeX/mermaid/callout/slug）；置 false 会静默丢失这些插件
	mdx(),
	// GitHub Pages 只协商 gzip 预压缩（br/zstd 旁车文件实测不被读取，纯属上传体积浪费）
	Compressor({ gzip: true, brotli: false, zstd: false, fileExtensions: [".html", ".css", ".js"] })
	],
	markdown: {
		// Astro 7 默认处理器为 satteri；本项目依赖 unified 管线的 remark/rehype 自定义插件，故显式指定 unified 处理器并在此挂载插件
		processor: unified({
			remarkPlugins: [remarkMermaid, remarkMath, remarkDirective, remarkNote],
			rehypePlugins: [[
				rehypeKatex, {
					output: 'mathml',
					trust: true,
					strict: false
				}
			], rehypeSlug, rehypeGithubCallout, [addClassNames, { base: '/blog/' }]],
		}),
		syntaxHighlight: 'shiki',
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			// 自定义围栏语言别名：user-dirs.dirs 实为 shell 片段，user-dirs.conf 为 ini 风格键值
			langAlias: { dirs: 'bash', conf: 'ini' },
		},
	},
	vite: { resolve: { alias: { "@": path.resolve(__dirname, "./src") } }, build: { cssMinify: 'esbuild' } },
	server: { host: '0.0.0.0' }
});
