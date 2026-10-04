import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}`;

export const GET: APIRoute = ({ site }) => {
  // site（如 https://example.com/sub）无尾斜杠时，相对解析会把末段路径整体替换掉，
  // 导致 base 子路径丢失；先拼 BASE_URL 再解析，保证 sitemap 地址带上 base 子路径
  const sitemapURL = new URL(import.meta.env.BASE_URL + 'sitemap-index.xml', site);
  return new Response(getRobotsTxt(sitemapURL));
};