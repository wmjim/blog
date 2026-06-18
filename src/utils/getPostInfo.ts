import { getCollection } from "astro:content";
const posts = (await getCollection("blog")).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
// 获取文章分类
const getCategories = () => {
  const categoriesList = posts.reduce((acc: any, i: any) => {
    acc[i.data.categories] = (acc[i.data.categories] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(categoriesList).map(([title, count]) => ({ title, count }));
}

// 获取统计数据
const getCountInfo = () => {
  return { ArticleCount: posts.length, CategoryCount: getCategories().length, TagCount: getTags().length }
}

// 获取文章标签
const getTags = () => {
  const tagList = posts.reduce((acc: any, i: any) => {
    (i.data.tags || []).forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
  return Object.entries(tagList).sort((a: any, b: any) => b[1] - a[1]);
}

// 获取推荐文章 (给文章添加 recommend: true 字段)
const getRecommendArticles = () => {
  const recommendList = posts.filter(i => i.data.recommend);
  return (recommendList.length ? recommendList : posts.slice(0, 6)).map(i => ({ title: i.data.title, date: i.data.date, id: i.data.id }))
};

// 获取上一篇下一篇文章
const getPrevNextPosts = (id: string) => {
  const noHidePosts = posts.filter(i => !i.data.hide);
  const index = noHidePosts.findIndex(i => i.data.id === id);
  const none = { title: '没有啦~', id: '#' };
  return { prev: noHidePosts[index - 1] ? noHidePosts[index - 1].data : none, next: noHidePosts[index + 1] ? noHidePosts[index + 1].data : none }
}

// 获取相关文章（按分类 + 标签重叠数排序）
const getRelatedPosts = (id: string, limit: number = 3) => {
  const current = posts.find(i => i.data.id === id);
  if (!current) return [];
  const others = posts.filter(i => i.data.id !== id && !i.data.hide);
  const scored = others.map(p => {
    let score = 0;
    if (p.data.categories === current.data.categories) score += 3;
    const currentTags = current.data.tags || [];
    const postTags = p.data.tags || [];
    postTags.forEach((t: string) => { if (currentTags.includes(t)) score += 1; });
    return { post: p, score };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({ title: s.post.data.title, date: s.post.data.date, id: s.post.data.id, categories: s.post.data.categories }));
}


export { getCategories, getTags, getRecommendArticles, getCountInfo, getPrevNextPosts, getRelatedPosts };