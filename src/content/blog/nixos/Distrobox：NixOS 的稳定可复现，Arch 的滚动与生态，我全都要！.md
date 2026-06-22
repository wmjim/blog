---
title: "Distrobox：NixOS 的稳定可复现，Arch 的滚动与生态，我全都要！"
categories: 驯服NixOS
tags:
  - nixos
  - distrobox
id: "a5049bc26b9b9eeb"
date: 2026-06-22 07:44:33
cover: "https://raw.githubusercontent.com/wmjim/blogimages/main/20260622083308197.jpg"

---

将 NixOS 作为个人物理机的主力系统，大概是我近些年做过最正确的决定之一。

NixOS 提供的稳定性与可复现性，无疑是驯服糟糕 Linux 桌面环境体验的一把利器。然而 NixOS 也有一些独属于它的痛点。

最大的困扰在于 NixOS 并不遵循标准的 FHS（文件系统层次结构标准）以及一些软件包的匮乏（虽然已经很丰富了）。

虽然在多数日常使用场景中，并不会带来明显影响。但在尝试本地编译一些开源项目时，往往会遇到依赖路径不匹配，需要借助 AI 额外生成针对 NixOS 的补丁才能顺利完成构建。

为了彻底解决这一痛点，我开始寻找更为优雅的容器化方案。

过程中，我关注到了两种主流工具：Distrobox 和 systemd-nspawn。

经过对比，最终选择了 Distrobox——其默认共享宿主机 Home 目录的特性，极大降低了日常使用的心智负担，确实非常便捷。

以下便是在 NixOS 上安装与使用 Distrobox 的具体步骤。

## 安装

安装 Distrobox 本身以及其底层容器运行时（此处选用 Podman）：

```nix
{ config, pkgs, ... }:

{
  # 安装 distrobox 和 podman (作为底层容器运行时)
  environment.systemPackages = with pkgs; [
    distrobox
    podman
  ];

  # 启用 podman 并设置相关服务
  virtualisation = {
    podman = {
      enable = true;
      dockerCompat = true; # 启用 docker 兼容命令，便于日常调用
    };
  };
}
```

## 日常使用

创建并进入容器环境的流程如下：

```bash
# 1. 创建一个最新版本的 archlinux 容器，并指定命名为 arch
distrobox create --name arch --image archlinux:latest
# 2. 进入容器环境，默认进入的目录即为宿主机终端当前所在目录
distrobox enter arch
```

**使用技巧与注意事项**：

- **设置别名**：为了提升效率，我习惯在 fish shell 中添加别名 `alias arch="distrobox enter arch"`。配置完成后，在终端输入 arch 即可一键切入容器环境。
- **环境隔离**：需要注意的是，Distrobox 容器默认仅共享宿主机的 Home 目录。这意味着宿主机上安装的 CLI 工具并不会自动继承到容器中，若需使用，仍需在容器内部重新安装。


### 常用维护命令

以下是日常管理容器时可能会用到的一些基础命令：

```bash
# 列出所有已创建的容器
distrobox list
# 停止正在运行的容器
distrobox stop <容器名>
# 删除指定容器
distrobox rm <容器名>
```

其实我也不常用。

## 最后想法

以 NixOS 作为坚实的系统底座提供日常稳定性，以 Arch Linux 容器作为特殊场景下的兼容性补充。

两者优势互补，体验相当完美！

当然最好再做一个虚拟机运行的 Win 系统，来补充极端情况下的需求，但那是另一篇文章的内容了。

Good bye!

