// 临时诊断中间件：追踪 /assets/images/footer/{hananalytics,sitemap,rss,icp}.svg 的 404 来源
// 定位到真凶后即删除本文件
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	const path = context.url.pathname;
	if (/\/assets\/images\/footer\/(hananalytics|sitemap|rss|icp)\.svg/.test(path)) {
		console.log(
			"[DBG-FOOTER-404]",
			"path=" + path,
			"| ua=" + (context.request.headers.get("user-agent") ?? "(无)"),
			"| accept=" + (context.request.headers.get("accept") ?? "(无)"),
			"| remote=" + (context.clientAddress ?? "(无)"),
			"| referer=" + (context.request.headers.get("referer") ?? "(无)")
		);
	}
	return next();
});
