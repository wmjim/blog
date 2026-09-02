---
title: "如何规划一个长期可维护的 Linux Home 目录"
categories: 分类
tags:
  - 标签1
  - 标签2
id: "27e6d95ca91dccaf"
date: 2026-06-28 07:18:34
cover: "https://raw.githubusercontent.com/wmjim/blogimages/main/20260619011149243.png"
draft: true
summary: "这篇文章介绍了如何规划并维护一个整洁的 Linux 用户家目录，包括修改 XDG 配置以去除中文目录、转移软件数据至统一归档目录，并设计个人专属的目录结构，有助于提升命令行操作效率与长期可维护性。"
---

随着在 Linux 桌面系统上安装和使用的软件越来越多，在没有得到管理的情况下，用户家目录（`~`）乱作一团。

1. XDG 生成中文目录
2. 不遵守 XDG 规范的软件直接创建 `~/xxx`
3. 用户将项目和文件扔进关联性不高目录里

## 修改 XDG 用户目录

`xdg-user-dirs`

当你选择系统语言为中文，GNOME 桌面环境启动时，`xdg-user-dirs` 会自动在家目录下为你生成一系列中文目录。

```
桌面
下载
文档
图片
音乐
视频
模板
公共
```

如果是对纯图形界面用户来说，这样的服务倒是很贴心。但作为一个 Linux 用户，作为一个要常常与终端 CLI
打交道的用户。

在用户家目录下生成一堆中文目录，极其不方便与之交互。为此有必要做以下修改。

1. 修改配置文件 `~/.config/user-dirs.locale`

```text
en_US
```

修改默认语言为中文，仅对 `xdg-user-dirs` 生成目录有效。

2. 修改配置文件 `~/.config/user-dirs.dirs`：

```dirs
XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_MUSIC_DIR="$HOME/Music"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"
XDG_PUBLICSHARE_DIR="$HOME/Public"
XDG_TEMPLATES_DIR="$HOME/Templates"
```

然后运行：`xdg-user-dirs-update`。

将原来家目录下的 桌面、文档 等里面的文件转移到新的英文目录中，然后删除这些空的中文名文件夹。

3. 编辑 `~/.config/user-dirs.conf`：

```conf
enabled=False
```

彻底禁止 `xdg-user-dirs` 重新生成中文目录，防止系统下次登录又改回去。

## 软件目录归档

查看哪些在 Home 目录下生成对应目录软件的设置，找一找能不能将该目录重新设置。

比如我就在 Calibre Library、微信、Zotero 的设置里找到了这些数据文件存放可修改的选项。

推荐将这些软件所产生的数据目录都放在 `~/Apps`/`~/Applications` 目录中进行管理。

## 设计个人专用家目录

```text
~/
├── Apps/             # [软件中心] 管理各类图形软件产生的数据目录
│
├── Desktop/          # [系统默认] 桌面文件
├── Documents/        # [系统默认] 普通文档、电子书、PDF、Notes等
├── Downloads/        # [系统默认] 下载专区（定期清理的垃圾桶）
├── Pictures/         # [系统默认] 图片、壁纸、截图
├── Videos/           # [系统默认] 视频
├── Music/            # [系统默认] 音乐
│
├── Projects/         # [个人核心] 个人主导的代码项目、写作稿件等
├── Workspace/        # [个人核心] 第三方代码、学习用的练习仓库、克隆的开源项目
├── Courses/          # [个人核心] 个人学习的课程本地缓存视频、课程相关的笔记、资料、书籍等
├── Scripts/          # [个人核心] 个人编写的 shell/python 脚本，并加入 PATH
├── VirtualBox/       # [个人核心] 存放 VM/VirtualBox 的虚拟磁盘文件（体积大，单独管理）
├── Archive/          # [个人核心] 存放已归档，几乎不再修改的文件
│
├── .config/          # [系统隐藏] 现代软件的配置文件目录（XDG标准）
├── .local/           # [系统隐藏] 现代软件的数据和可执行文件目录
├── .cache/           # [系统隐藏] 各种缓存（可随时删除）
```

## 尾言

以上就是个人规划的一个可长期维护的用户家目录！
