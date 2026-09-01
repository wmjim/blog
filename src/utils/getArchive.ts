
import { getBlogPosts } from "./getBlogPosts";
import readingTime from "reading-time";
import dayjs from "dayjs";
import SITE_CONFIG from "@/config";
import { getDescription } from "@/utils/index";

// 计算文章阅读时长与摘要，注入展示所需字段
const enhancePost = (item: any) => {
  // 剔除 HTML 标签后计算，避免标签干扰词数统计
  const text = (item.body || "").replace(/<[^>]+>/g, " ");
  return {
    ...item.data,
    readTime: Math.max(1, Math.ceil(readingTime(text).minutes)),
    summary: item.data.summary || getDescription(item, 100),
  };
};

// 格式化文章列表（按年份 + 月份分组）
const fmtArticleList = (articleList: any) => {
  // 按年份分类
  const groupedByYear = articleList.reduce((acc: any, item: any) => {
    const year = item.data.date.getFullYear();
    !acc[year] && (acc[year] = []);
    acc[year].push(enhancePost(item));
    return acc;
  }, {});
  // 转换为目标格式（年份内按月份子分组）
  return Object.keys(groupedByYear)
    .map(year => {
      const yearPosts = groupedByYear[year];
      // 按月份分组
      const monthMap = yearPosts.reduce((m: any, p: any) => {
        const month = p.date.getMonth() + 1;
        !m[month] && (m[month] = []);
        m[month].push(p);
        return m;
      }, {});
      const months = Object.keys(monthMap)
        .map(m => ({ name: parseInt(m), data: monthMap[m] }))
        .reverse();
      return { name: parseInt(year), data: yearPosts, months };
    })
    .reverse();
}

// 获取分类下的文章列表
const getCategoriesList = async (categories: string) => {
  const posts = await getBlogPosts();
  const articleList = posts.filter((i: any) => i.data.categories == categories).sort((a: any, b: any) => b.data.date.valueOf() - a.data.date.valueOf());;
  return fmtArticleList(articleList);
}

// 获取标签下的文章列表
const getTagsList = async (tags: string) => {
  const posts = await getBlogPosts();
  const articleList = posts.filter((i: any) => (i.data.tags || []).map((_i: any) => (String(_i))).includes(tags)).sort((a: any, b: any) => b.data.date.valueOf() - a.data.date.valueOf());
  return fmtArticleList(articleList);
}

// 获取归档列表
const getArchiveList = async () => {
  const posts = await getBlogPosts();
  const articleList = posts.sort((a: any, b: any) => b.data.date.valueOf() - a.data.date.valueOf());;
  return fmtArticleList(articleList);
}

// 获取归档页统计（建站天数 / 文章数 / 总字数）
const getArchiveStats = async () => {
  const posts = await getBlogPosts();
  let words = 0;
  for (const p of posts) {
    words += readingTime((p.body || "").replace(/<[^>]+>/g, " ")).words;
  }
  const days = dayjs().diff(dayjs(SITE_CONFIG.CreateTime), "day");
  return { days: Math.max(0, days), articles: posts.length, words };
}

// 获取全部分类列表
const getAllCategories = async () => {
  const posts = await getBlogPosts();
  const cateMap = new Map<string, number>();
  posts.forEach((post: any) => {
    const cate = post.data.categories;
    cateMap.set(cate, (cateMap.get(cate) || 0) + 1);
  });
  return Array.from(cateMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count);
};

// 获取全部标签列表
const getAllTags = async () => {
  const posts = await getBlogPosts();
  const tagMap = new Map<string, number>();
  posts.forEach((post: any) => {
    (post.data.tags || []).forEach((tag: string) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count);
};

export { getCategoriesList, getTagsList, getArchiveList, getAllCategories, getAllTags, getArchiveStats };