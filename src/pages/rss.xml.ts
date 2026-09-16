import { getRssString } from '@astrojs/rss';
import { getBlogPosts } from '@/utils/getBlogPosts'
import { getDescription } from '@/utils/index'
import SITE_CONFIG from '@/config';
const { Title, Description } = SITE_CONFIG;

export async function GET(context: any) {
	const posts = await getBlogPosts();
	const res = await getRssString({
		title: Title,
		description: Description,
		site: context.site,
		// 站内文章链接与 sitemap 均无尾斜杠，link/guid 在此统一，避免 isPermaLink guid 与实际页面 URL 不符
		trailingSlash: false,
		items: posts.filter(i => !i.data.hide).map((post) => ({
			title: post.data.title,
			pubDate: post.data.updated || post.data.date,
			description: getDescription(post),
			link: `${import.meta.env.BASE_URL}article/${post.data.id}`
		})).sort((a: any, b: any) => (new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())),
	});
	// 添加 XML 样式表指令
	const xmlHead = '<?xml version="1.0" encoding="UTF-8"?>';
	const xmlMain = res.replace(xmlHead, `${xmlHead}<?xml-stylesheet type="text/xsl" href="${import.meta.env.BASE_URL}rss.xsl" ?>`);
	return new Response(xmlMain, { headers: { 'Content-Type': 'application/xml' } });
}
