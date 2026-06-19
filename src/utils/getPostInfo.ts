import { getBlogPosts } from "./getBlogPosts";

// 懒加载文章列表 (缓存结果，dev 下包含草稿)
let _postsCache: any[] | null = null;
const getAllPosts = async () => {
  if (!_postsCache) {
    _postsCache = (await getBlogPosts()).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  }
  return _postsCache;
};

// 同步版本 — 用于 Astro 组件 frontmatter 中的同步调用
// 首次调用时 posts 可能为空，但 getPostInfo 的函数在 Aside 等组件中用 await 调用
let _postsSync: any[] = [];
const ensurePosts = async () => {
  if (!_postsSync.length) {
    _postsSync = await getAllPosts();
  }
  return _postsSync;
};

// 获取文章分类
const getCategories = async () => {
  const posts = await ensurePosts();
  const categoriesList = posts.reduce((acc: any, i: any) => {
    acc[i.data.categories] = (acc[i.data.categories] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(categoriesList).map(([title, count]) => ({ title, count }));
}

// 获取统计数据
const getCountInfo = async () => {
  const posts = await ensurePosts();
  const cats = await getCategories();
  const tags = await getTags();
  return { ArticleCount: posts.length, CategoryCount: cats.length, TagCount: tags.length }
}

// 获取文章标签
const getTags = async () => {
  const posts = await ensurePosts();
  const tagList = posts.reduce((acc: any, i: any) => {
    (i.data.tags || []).forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
  return Object.entries(tagList).sort((a: any, b: any) => b[1] - a[1]);
}

// 获取推荐文章 (给文章添加 recommend: true 字段)
const getRecommendArticles = async () => {
  const posts = await ensurePosts();
  const recommendList = posts.filter((i: any) => i.data.recommend);
  return (recommendList.length ? recommendList : posts.slice(0, 6)).map((i: any) => ({ title: i.data.title, date: i.data.date, id: i.data.id }))
};

// 获取上一篇下一篇文章
const getPrevNextPosts = async (id: string) => {
  const posts = await ensurePosts();
  const noHidePosts = posts.filter((i: any) => !i.data.hide);
  const index = noHidePosts.findIndex((i: any) => i.data.id === id);
  const none = { title: '没有啦~', id: '#' };
  return { prev: noHidePosts[index - 1] ? noHidePosts[index - 1].data : none, next: noHidePosts[index + 1] ? noHidePosts[index + 1].data : none }
}

// 获取相关文章（按分类 + 标签重叠数排序）
const getRelatedPosts = async (id: string, limit: number = 3) => {
  const posts = await ensurePosts();
  const current = posts.find((i: any) => i.data.id === id);
  if (!current) return [];
  const others = posts.filter((i: any) => i.data.id !== id && !i.data.hide);
  const scored = others.map((p: any) => {
    let score = 0;
    if (p.data.categories === current.data.categories) score += 3;
    const currentTags = current.data.tags || [];
    const postTags = p.data.tags || [];
    postTags.forEach((t: string) => { if (currentTags.includes(t)) score += 1; });
    return { post: p, score };
  });
  return scored
    .filter((s: any) => s.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit)
    .map((s: any) => ({ title: s.post.data.title, date: s.post.data.date, id: s.post.data.id, categories: s.post.data.categories }));
}


export { getCategories, getTags, getRecommendArticles, getCountInfo, getPrevNextPosts, getRelatedPosts };