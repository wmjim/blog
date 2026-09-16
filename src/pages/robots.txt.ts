import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}`;

export const GET: APIRoute = ({ site }) => {
  // site（如 https://wmjim.github.io/blog）无尾斜杠时，相对解析会把末段路径整体替换掉，
  // 导致 base 子路径丢失；先拼 BASE_URL 再解析，保证指向 /blog/sitemap-index.xml
  const sitemapURL = new URL(import.meta.env.BASE_URL + 'sitemap-index.xml', site);
  return new Response(getRobotsTxt(sitemapURL));
};