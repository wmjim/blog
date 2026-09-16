---
title: "搭建Linux平台下单片机开发环境"
categories: linux
tags:
  - 标签1
  - 标签2
id: "1e5ad4f6a8f6e1df"
date: 2026-09-04 15:19:55
cover: "封面图URL (为空默认随机内置封面 /public/assets/images/banner)"
recommend: false # 是否推荐文章
top: false # 是否置顶文章
hide: false # 是否隐藏文章
summary: "本文系统介绍了在 Linux 平台搭建 STM32 开发环境的完整流程，涵盖从源代码编写、交叉编译、链接、二进制提取到 OpenOCD 烧录与 GDB 调试的全链条，并推荐了 STM32CubeMX、VS Code、arm-none-eab…"
---


## 整体开发环境

**完整开发链条**：源代码 → 交叉编译 → 链接（带链接脚本）→ objcopy 提取二进制 → OpenOCD 烧录 → GDB 调试。

| 功能       | 推荐工具                     |
| --------  | ------------------------ |
| 项目生成    | STM32CubeMX              |
| 编辑代码    | VS Code                  |
| 编译器     | arm-none-eabi-gcc        |
| 烧录和调试     | OpenOCD + ST-Link        |
| 构建系统       | Make(小项目) / CMake(大项目) |
| 版本管理     | Git                      |

1. 使用 VSCode/Vim 编写的 C/C++ 代码经过预处理、编译、汇编，编程一个个目标文件。这里使用 `arm-none-eabi-gcc` 编译 C 代码、`arm-none-eabi-g++` 编译 C++ 代码。
2. 将上面编译生成的目标文件，使用 `arm-none-eabi-ld`（链接器）粘在一起。把所有目标文件、库文件按照指定的规则拼成一个完整的程序。
3. 经过链接过程，得到 ELF 格式（`.elf`）的文件（包含代码、数据、符号表等一堆信息）。
4. 使用 `arm-none-eabi-objcopy` 将 ELF 文件里的“干货”提炼出来，生成一个 `.bin` 二进制文件（烧录进 Flash）。
5. 烧录工具选择 ST-Link V2（ST 官方出的调试器/烧录器），使用 SWD（Serial Wire Debug）协议与 STM32 通信。
6. 在 Linux 平台，使用 OpenOCD 驱动 ST-Link 把固件烧写进 Flash 里。
7. OpenOCD 以 GDB Server 模式运行，监听某个端口（默认3333），使用 `arm-none-eabi-gdb` 连接，就可以调试程序了。

## 安装

### 安装基础开发工具

```bash
# Ubuntu / Debian 为例
sudo apt update
sudo apt install build-essential git cmake make ninja-build
```

### 安装 ARM 单片机交叉编译器

开发 STM32、GD32 等 ARM Cortex-M 系列单片机，需安装 ARM 交叉编译器：

```bash
# 包含交叉编译器、链接器、objcopy、size 等一整套工具
sudo apt install gcc-arm-none-eabi
# ARM 版本 GDB，用于调试嵌入式程序
sudo apt install gdb-arm-none-eabi
```

- `gcc`：GUN Compiler Collection。
- `arm`：目标平台 CPU 架构，嵌入式项目生成的代码是给 ARM 平台机器使用的。
- `none`：没有操作系统厂商。
- `eabi`：嵌入式应用二进制接口（Embedded Application Binary Interface）。

### 安装 OpenOCD

```bash
sudo apt install openocd
```

OpenOCD 主要用于：

1. 下载程序；
2. 在线调试；
3. 连接 ST-Link/J-Link

### 安装 ST-Link

```bash
sudo apt install stlink
```

### 验证

```bash
# 验证编译器
arm-none-eabi-gcc --version
# 验证调试器
arm-none-eabi-gdb --version
# 验证烧录工具
openocd --version
# 将设备通过 ST-Link 连接电脑，验证 ST-Link
st-info --probe
# 验证 CMake
cmake --version
# 验证 GCC
gcc --version
# 验证版本管理
git --version
# 验证 Make
make --version
# 验证 Ninja
ninja --version
```


### 安装 VSCode

在 VSCode 官网下载程序并安装，该软件的具体安装过程不再赘述。不过建议安装以下插件：

- C/C++：提供代码补全、跳转定义、IntelliSense
- Cortex-Debug：支持 STM32、GD32等 Cortex-M 芯片的图形化调试
- CMake Tools

### 安装 STM32-CubeMX

STM32-CubeMX 是 ST 官方提供的 STM32 系列单片机的配置工具，用于生成初始化代码、外设配置、中断配置等。

```bash
yay -S stm32cubemx
```