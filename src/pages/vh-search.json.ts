import * as cheerio from 'cheerio';
import { getBlogPosts } from '@/utils/getBlogPosts';

// 搜索索引静态端点：随构建产出 dist/vh-search.json，开发模式按请求实时返回
// 取代旧实现（[...page].astro getStaticPaths 内 fs 直写 dist/ + public/ 的副作用）；
// 与 rss.xml.ts 一致，排除 hide 文章（旧实现把隐藏文章也写进了索引）
export async function GET() {
	const posts = await getBlogPosts();
	const searchIndex = posts
		.filter((i: any) => !i.data.hide)
		.map((i: any) => {
			const $ = cheerio.load(`<body>${i.rendered?.html ?? i.body}</body>`);
			return {
				title: i.data.title,
				url: `${import.meta.env.BASE_URL}article/${i.data.id}`,
				// 正文压成纯文本供客户端关键字匹配；沿用旧实现仅去换行、不去空白，
				// 保证跨行匹配结果与历史索引一致
				content: `${i.data.title} - ` + $('body').text().replace(/\n/g, '')
			};
		});
	return new Response(JSON.stringify(searchIndex), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' }
	});
}
