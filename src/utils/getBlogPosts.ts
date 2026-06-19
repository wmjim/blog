import { getCollection } from "astro:content";

// 获取博客文章 — 开发模式下包含草稿，生产构建时排除草稿
export const getBlogPosts = async () => {
  const posts = await getCollection("blog");
  return import.meta.env.DEV ? posts : posts.filter((i: any) => !i.data.draft);
};
