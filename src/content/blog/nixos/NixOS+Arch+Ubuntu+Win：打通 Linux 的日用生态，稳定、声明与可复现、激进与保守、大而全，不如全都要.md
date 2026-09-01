---
title: "NixOS+Arch+Ubuntu+Win：打通 Linux 的日用生态，稳定、声明与可复现、激进与保守、大而全，不如全都要"
categories: Linux
tags:
  - nixos
  - kvm
  - arch
  - ubuntu
id: "17573323c0281d22"
date: 2026-06-22 17:07:44
cover: "https://raw.githubusercontent.com/wmjim/blogimages/main/20260901182410345.png"
---

作为一个计算机用户总是贪心的，即想要 Linux 的编程体验、又想要 Windows 大而全支持的生态支持，还想要 MacOS 的高颜值。

然而现实是无情残酷的，目前尚无一个系统能够做到既要又要还要。所以普遍的方案如下：

1. Windows 为生态底座，WSL2 提供开发环境；
2. Linux 为开发底座，虚拟机 Win 补充生态；
3. MacOS 为生产底座，虚拟机 Win 补充生态；

笔者长时间正是采用方案1作为日用，这种体验倒是还行，只不过随着使用系统越来越臃肿。

至于方案3，笔者暂时贫困，实无力承担一笔高昂的使用费用。也许以后会补充一台 Macbook Air 作为外出使用。

经过一段时间在笔记本上的测试，使我确信 Linux 生态大概也是能够满足我的日用开发需求，且在开发使用上比 Win 的体验更好，毕竟是 Linux 的专长。

## 选择 Linux 发行版

既然下决心使用 Linux，选择哪个发行版呢？社区最常见的推荐：Ubuntu? Arch? Fedora? NixOS?

不同 Linux 发行版代表了不同的设计哲学：

- Fedora：自由软件前沿，创新与稳定的平衡；
- Ubuntu：为大众而生，开箱即用；
- Arch：极简主义，用户高度自定义，滚动更新；
- NixOS：声明式配置，可复现，函数式包管理，原子化升级与回滚；

如果你是第一次使用 Linux，那 Ubuntu 是个最佳选择。

因为全世界开发者使用的数量比较多，遇到问题的解决方案网上有很多，避免了你很多的折腾。也因为使用的开发者数量众多，很多新的应用会优先考虑 Ubuntu 的适配。

不过我毕竟已不是第一次使用 Linux 了，长时间的使用笔者积累了一堆的配置和文档，自然而然地就被 NixOS 吸引了。

当然你也可以选择：Arch/Ubuntu/Fedora 为底座，使用 nix 管理你的一些用户应用和配置。也都行，主要看你中意哪种设计哲学，It's free.

## 我的 Linux 生态方案


既然选定了 NixOS 作为物理机系统，就这样使用了一段时间，也就体会到了 NixOS 天然的缺陷：

一个是生态还是缺了点（这部分也不全是 NixOS的锅，Linux 生态闭源软件支持确实还瘸腿）；

另一个就是不支持 FHS，虽然日用影响不大，但偶尔拉个项目编译，可能需要 AI 帮我打很多补丁。

那就索性折腾出一套大而全的方案，既要 NixOS 的声明式配置与可复现，又要 Arch 和 Ubuntu 的补充和通用 Linux 特性，以及 Win 全面的生态。

## Distrobox

实际上注意到两套技术方案：Distrobox 和 systemd-nspawn。

`systemd-nspawn` 更轻量，代价就是简陋，需要自己折腾更多的实现才能满足基本需求。

切换环境的需求不常用，一点点性能损耗还是可以接受的，因此我更愿意要 Distrobox 的开箱既用。

### 安装

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

### 创建并进入容器环境

```bash
# 1. 创建一个最新版本的容器，并指定命名
distrobox create --name arch --image archlinux:latest
distrobox create --name ubuntu --image ubuntu:latest

# 2. 进入容器环境
distrobox enter arch

# 3. 如果你有将容器内应用包装成宿主机桌面快捷方式的需求
distrobox-export --app firefox
```

- **设置别名**：为了提升效率，我习惯在 fish shell 中添加别名 `alias arch="distrobox enter arch"`、`alias ubuntu="distrobox enter ubuntu"`。配置完成后，在终端输入 `arch`/`ubuntu` 即可一键切入容器环境。
- **环境隔离**：需要注意的是，Distrobox 容器默认仅共享宿主机的 Home 目录。这意味着宿主机上安装的 CLI 工具并不会自动继承到容器中，若需使用，仍需在容器内部重新安装。


### 补充常用维护命令

以下是日常管理容器时可能会用到的一些基础命令：

```bash
# 列出所有已创建的容器
distrobox list
# 停止正在运行的容器
distrobox stop <容器名>
# 删除指定容器
distrobox rm <容器名>
```

我就创建俩容器，足够我的使用了，因此这些维护命令基本用不到，列在这里供可能的需求吧。

## KVM：虚拟机安装 Win11

准备安装镜像

- [win11 精简版镜像](https://software-static.download.prss.microsoft.com/dbazure/998969d5-f34g-4e03-ac9d-1f9786c66749/26100.1742.240906-0331.ge_release_svc_refresh_CLIENT_IOT_LTSC_EVAL_x64FRE_en-us.iso)
- [virtio](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio/?C=M;O=D)：网卡和硬盘会使用 virtio 的模型

安装的过程参考视频教程：

::vhVideo{url="https://www.bilibili.com/video/BV1XzGt6YEiy?t=204.7"}


## 最后想法

以 NixOS 作为坚实的系统底座提供日常稳定性，Arch Linux 容器提供通用 Linux 特性和激进的软件生态，Ubuntu 容器作为补充一些可能独属于 Ubuntu 的软件，虚拟机 Windows 补充极端情况下的软件需求。

以上就是笔者在 NixOS 上折腾出来的一套大而全的生态，基本做到了我全都要！