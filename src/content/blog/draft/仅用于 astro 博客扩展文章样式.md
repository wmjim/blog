---
title: "仅用于 astro 博客扩展文章样式"
categories: 测试专用
tags:
  - astro
  - markdown
id: "27b6a705596126c0"
date: 2026-06-19 01:17:40
cover: "https://raw.githubusercontent.com/wmjim/blogimages/main/20260619011149243.png"
draft: true
---

## 按钮组件

```md
<!-- 支持类型：info、success、warning、error、import -->
::btn[标题]{link="指向链接" type="info"}
```

::btn[通知]{link="链接" type="info"}
::btn[成功]{link="链接" type="success"}
::btn[警告]{link="链接" type="warning"}
::btn[错误]{link="链接" type="error"}
::btn[导入]{link="链接" type="import"}

## GitHub 仓库卡片组件

```md
::github{repo="wmjim/nixos-config"}
```

::github{repo="wmjim/nixos-config"}

## Note 组件 — :::note 语法

```md
<!-- 支持类型：info、success、warning、error、import -->
:::note{type="info"}
组件内容
:::
```

:::note{type="info"}
note 组件 info 主题
:::

:::note{type="success"}
note 组件 success 主题
:::

:::note{type="warning"}
note 组件 warning 主题
:::

:::note{type="error"}
note 组件 error 主题
:::

:::note{type="import"}
note 组件 import 主题
:::

## Note 组件 — > [!info] 块引用语法

```md
> [!info]
> 这是 GitHub 风格的 info 提示。
```

> [!info]
> 这是 GitHub 风格的 info 提示。

> [!tip]
> 这是 GitHub 风格的 tip 提示。

> [!warning]
> 这是 GitHub 风格的 warning 提示。

> [!caution]
> 这是 GitHub 风格的 caution 提示。

> [!important]
> 这是 GitHub 风格的 important 提示。

> [!info] 自定义标题
> 可以自定义标题文字，替换默认标题。

## 图片组件

```md
:::picture
![图片1标题](图片1链接)
![图片2标题](图片2链接)
![图片3标题](图片3链接)
:::
```

:::picture
![仅作测试](https://raw.githubusercontent.com/wmjim/blogimages/main/20260619011149243.png)
![仅作测试](https://raw.githubusercontent.com/wmjim/blogimages/main/20260619011149243.png)
![仅作测试](https://raw.githubusercontent.com/wmjim/blogimages/main/20260619011149243.png)
:::

## LIVE 动图组件

```md
<!-- 纵向图片 -->
::vhLivePhoto{photo="https://static.vvhan.com/img/1.webp" video="https://static.vvhan.com/img/1.mp4" type="y"}
<!-- 横向图片 -->
::vhLivePhoto{photo="https://static.vvhan.com/img/2.webp" video="https://static.vvhan.com/img/2.mp4"}
```

<!-- 纵向图片 -->
::vhLivePhoto{photo="https://static.vvhan.com/img/1.webp" video="https://static.vvhan.com/img/1.mp4" type="y"}
<!-- 横向图片 -->
::vhLivePhoto{photo="https://static.vvhan.com/img/2.webp" video="https://static.vvhan.com/img/2.mp4"}

## 音乐组件

```md
<!-- id 支持：歌曲 id / 歌单 id / 专辑 id / 搜索关键词
type 支持：song, playlist, album, search（默认值：song）
server 支持：netease, tencent, kugou, xiami, baidu（默认值：netease） -->
<!-- 单曲 -->
::vhMusic{id="1474697967"}
<!-- 列表 -->
::vhMusic{id="173901981" type="playlist"}
```

<!-- 单曲 -->
::vhMusic{id="1474697967"}
<!-- 列表 -->
::vhMusic{id="173901981" type="playlist"}

## 视频组件

支持两种视频来源：
- **直链视频**（`.mp4` / `.m3u8` / `.flv`）：使用 DPlayer 播放器
- **平台视频**（Bilibili / YouTube）：自动识别并使用 iframe 嵌入

```md
::vhVideo{url="视频直链或平台链接"}
```

### Bilibili 视频

```md
::vhVideo{url="https://www.bilibili.com/video/BV1Vpjc6NEHq?t=1.8"}
```

::vhVideo{url="https://www.bilibili.com/video/BV1Vpjc6NEHq?t=1.8"}

### YouTube 视频

```md
::vhVideo{url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
```

::vhVideo{url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"}

### 直链视频

```md
<!-- 直链 .mp4 / .m3u8 / .flv 使用 DPlayer 播放器 -->
::vhVideo{url="https://vjs.zencdn.net/v/oceans.mp4"}
```

::vhVideo{url="https://vjs.zencdn.net/v/oceans.mp4"}

