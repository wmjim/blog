---
version: 1
slug: "src-pages-article-article-astro"
primary_target: "src/pages/article/[...article].astro"
related_targets: []
---

# Surface brief — 文章页 / 全站（Void 博客）

<!-- impeccable:surface-schema 1 -->
visitor mode: read

## Scope

全站视觉世界替换（首页列表、文章页、归档/分类/标签、关于/友链等所有 Read 表面）。功能（评论 Waline、搜索、深色模式、Swup、Mermaid/KaTeX/callout、归档统计）全部保留。平台：web（Astro 7 静态站点）。

## Audience & job

技术读者（搜索引擎 / RSS / 友链进入）想读懂并复用一篇实操笔记；作者本人回看。成功 = 找得到、读得进、学得会。

## Chosen direction

Pocket Reference — 把整站做成一本随身技术手册（O'Reilly Nutshell 的窄开本参考书）。本方向为我的首选候选（不是掷骰指派项）；掷骰指派项为第 7 号「标准文档」。目录缩略索引、等宽小标签、谷仓红书标、发丝线分节。

## Direction contract

THESIS: 每篇文章都是同一册随身技术手册里的一条编号条目；拒绝「居中单栏 + 头像页眉 + 卡片列表」这套个人博客默认款。

OWN-WORLD: 暖白纸面 #fffdf8 + 墨 #2b2721；谷仓红 #b8392c 书标仅用于分类标签 / § 章节号 / 页边小标题 / 书眉印；青蓝 #1f6f8f 用于可点文字；等宽大写微标签（mono uppercase tracking）；衬线标题；发丝线 + 2px 双线书标分节；近直角；全程无投影。去掉名字后仍认得出是同一册手册。

STORY: 读者看到一本分节编号、带索引索引词的实操手册；扫目录 → 读栏 → 找到答案。分类像索引标签，日期像页脚元数据带，代码像手册里的清单。

FIRST VIEWPORT: 等宽大写 VOID 书眉 + 谷仓红下划书线；下方衬线大号站点名 + 红色书签方标 + 双线书标；再下方发丝线分隔的条目流，每条 = 红色等宽分类标签 + 墨色衬线标题 + 等宽日期/阅读时长 + 摘要 + 等宽标签。

FORM: Pocket Reference（口袋参考书），我排序列表第 1 位；seed key 900c873e。

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved

- 移动端抽屉目录、移动浮动目录按钮沿用既有交互，仅换皮。
- 归档/分类/标签/关于/友链页采用同一套 token 自动继承，未逐页精修。
