---
title: "搭建以termux为底座的安卓手机开发环境"
categories: 安卓玩机
tags:
   - termux
   - android
id: "3d9f55037a84f360"
date: 2025-12-09 20:30:42
cover: "https://raw.githubusercontent.com/wmjim/blogimages/main/20260618191515237.png"
---

Termux 是一款 Android 终端模拟器和 Linux 环境应用，无需 root 或额外设置即可直接运行。系统会自动安装一个最小化的基础系统。

## 安装

推荐从 [F-Droid](https://f-droid.org/packages/com.termux/) 获取安装包进行安装。

## 远程连接

首先需要手机上安装 Termux 。

安装完成后打开 Termux，安装 sshd，作为 ssh 服务端。

```bash
# 更新软件源和软件包
pkg update
pkg upgrade

# 安装 ssh
pkg install openssh

# 设置密码
passwd

# 开启sshd服务
sshd

# 查看ip地址
ifconfig # ip a
```

然后在 ssh 客户端连接：

```bash
# 此处ip地址换成你查询到自己手机端ip地址
ssh -p 8022 192.168.0.104 # 默认端口号是 8022
```

## 保持 Termux 活动

保持 Termux 在熄屏状态下 SSH 连接不断开。

### 1、使用 Termux 自带唤醒

```bash
# 1. 安装termux-wake-lock工具
pkg install termux-api

# 2. 启用Wakelock
termux-wake-lock

# 3. 关闭wakelock(当你不需要时)
termux-wake-unlock
```

执行后，Termux 的持久通知栏中出现一个选项，表示已启用唤醒锁。

![](https://raw.githubusercontent.com/wmjim/blogimages/main/5e9802f6ff0cc2fd41acf468f3aad6a9.jpeg)

### 2、禁用 Termux 的电池优化

现代 Android 系统有严格的电池优化策略，可能会在熄屏后杀死或限制 Termux 进程。

- 进入 **Android 设置** > **应用** > **Termux**。
- 查找 **电池** 或 **省电优化** 选项。
- 将 Termux 设置为 **“不受限制”**、**“不优化”** 或 **“允许后台活动”**。

![](https://raw.githubusercontent.com/wmjim/blogimages/main/c51cbbfedfd67a6296c5318140fca974.jpg)

## 样式美化

## 使用预设主题和字体

安装 [Termux:Styling](https://f-droid.org/packages/com.termux.styling/) 

安装后，进入 Termux。

1. 终端内任意位置长按，选择 **More...** 菜单项。
2. 在弹出的对话框选择 **Style**。
3. 在此步选择 **CHOOSE COLOR** 或 **CHOOSE FONT** 进行你的个性化配置吧。

### 手动安装字体

[https://github.com/subframe7536/maple-font](https://github.com/subframe7536/maple-font)

```bash
# 安装字体
pkg install wget
wget https://github.com/subframe7536/maple-font/releases/download/v7.9/MapleMonoNormalNL-NF-CN-unhinted.zip
unzip MapleMonoNormalNL-NF-CN-unhinted.zip

# 将字体重命名为 font.ttf 并放入 ~/.termux/
mv MapleMonoNormalNL-NF-CN-Regular.ttf ~/.termux/font.ttf

# 加载设置
termux-reload-settings
```

## 官方仓库

官方仓库可能在国内访问速度较慢，Termux 提供了 `termux-change-repo` 工具来切换镜像源（比如国内的镜像站）。
• **基础的 `main` 仓库默认已经启用**，不需要额外操作，你直接用 `pkg install 软件名` 就能安装 Linux 常用工具（比如 `curl`、`git`、`python` 等）。
• **可选仓库（game、science、root、x11）默认不启用**，**只有当你需要安装对应领域的软件时，才需要手动启用**。

- `game-repo`：包含各类开源小游戏；
- `science-repo`：包含科学计算相关工具（比如数学、统计、数据处理类软件）；
- `root-repo`：包含需要 root 权限才能运行的工具；
- `x11-repo`：包含 X11 图形界面相关的软件，**仅支持 Android 7 及以上系统**。

```bash
# 执行对应命令后，该仓库就会被添加到 Termux 软件源列表
pkg install game-repo
pkg install science-repo
pkg install root-repo
pkg install x11-repo
```

## 包管理

建议使用`pkg`工具，而不是直接使用`apt`。

```bash
# 1. 从缓存中删除过时的 .deb 文件
pkg autoclean 
# 2. 从缓存中删除所有 .deb 文件
pkg clean

# 3. 列出指定软件包安装的文件
pkg files <package>

# 4. 列出所有可用的包
pkg list-all
# 5. 列出当前已安装的软件包
pkg list-installed

# 6. 重新安装指定包
pkg reinstall <package>

# 7. 按照 query 搜索包
okg search <query>

# 8. 显示特定包信息
pkg show <package>

# 9. 安装新的软件包
pkg upgrade # 强烈建议在安装新软件包之前升级现有软件包
pkg install <package-name>

# 10. 卸载已安装的包
pkg uninstall package-name
# 移除软件包的修改配置文件
apt purge

```

## Shell

Fish 是一款智能且用户友好的命令行 Shell 程序。

```bash
# 安装 fish
pkg install fish

# 更换默认 shell
termux-change-shell
```

用户可通过修改以下两个文件来自定义 Shell 行为：

- 个人配置：`~/.fish` ，用户专属初始化文件。
- 全局配置：`$PREFIX/etc/fish/config.fish` ，系统级全局配置文件。

### Fisher

[Fisher](https://github.com/jorgebucaran/fisher) 一款适用于 [Fish](https://fishshell.com/) 的插件管理器。

```bash
# 1. 安装 Fisher
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher

# 2. 更新所有已安装的插件
fisher update
# 更新指定已安装插件
fisher update <plugins...>

# 3. 下载插件
fisher install <plugins...>

# 4. 移除插件
fisher remove  <plugins...>

# 5. 列出与正则表达式匹配的已安装插件
List installed plugins matching regex

```

```bash
# 1. 目录跳转工具，记忆你常用目录
fisher install jethrokuan/z
# 2. 把模糊查找工具 fzf 集成到 Fish 中
fisher install PatrickF1/fzf.fish
# 3. 给 man 手册页加语法高亮、颜色
fisher install decors/fish-colored-man
# 4. 给一些命令（如 grep、diff 等）加彩色输出，提高可读性
fisher install fishplugin-grc
# 5. 将以毫秒／秒为单位的时间或日志显示转换为更人性化格式
fisher install fishplugin-humantime-fish
```

## 开发环境

可以在此 [Development Environments](https://wiki.termux.com/wiki/Development_Environments) 文档选择你要安装的开发环境，本文只挑选一个个人所需的开发环境。

```bash
# C/C++（默认已安装）
pkg install clang

# Golang
pkg install golang

# Lua
pkg install lua54

# Python
pkg install python

# Rust
pkg install rust

# 安装 Git
pkg install git

# fastfetch
pkg install fastfetch

# wget
pkg install wget
```

## 编辑器

选择 NeoVim。

```bash
# 1. 安装 neovim
pkg install neovim

# 2. 安装 lazyvim
git clone https://github.com/LazyVim/starter ~/.config/nvim

# 3. 启动 nvim
nvim 

# 备选：helix
pkg install helix
```

## 远程访问

### FTP

Termux FTP 服务器基于 busybox，其服务由 Termux-services 管理。

```bash
# 1. 安装 ftp 服务器
pkg install busybox termux-services

# 2. 安装后重启会话 或 加载此文件
source $PREFIX/etc/profile.d/start-services.sh

# 3. 启用并启动 ftp 守护进程服务
# ftp 服务器将在端口 8021 上以只读模式运行
sv-enable ftpd
sv up ftpd

# 4. 如果要停止服务器，运行
sv down ftpd
```

## 授予读写外部存储权限

Termux 默认有自身内存存储的读写权限，可以随便创建、修改、删除里面的文件，不需要额外授权。

但是手机里 “文件管理” 的目录，Termux 不能直接修改。

```bash
# 运行此命令，授予 Termux 读写手机外部存储权限
termux-setup-storage
```

运行这个命令后，会触发两个关键操作：

1. **弹出权限请求对话框**：你需要手动点击 “允许”，授予 Termux 读写手机外部存储的权限。
2. **创建快捷符号链接**：在 Termux 的 `$HOME/storage` 目录下，生成几个指向手机外部存储关键路径的链接，比如：
   - `downloads` → 手机的下载文件夹
   - `pictures` → 手机的图片文件夹
   - `shared` → 手机的共享存储根目录这样你在 Termux 里进入 `$HOME/storage/downloads`，就直接能操作手机下载文件夹里的文件了，不用记复杂的路径。