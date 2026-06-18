---
title: "GKD+AdGuard: 安卓手机自动跳过应用开屏广告"
categories: 安卓玩机
tags:
  - android
  - gkd
id: "fe799ce02c5cd16f"
date: 2025-12-12 18:22:35
cover: "https://raw.githubusercontent.com/wmjim/blogimages/main/20260619002955482.png"
---

笔者在使用安卓手机的过程中，深受应用无赖开屏广告的困扰，最终打算解决一下的。

在询问 AI 之后，个人选用了一套 GKD + AdGurad  + 关闭通知的方案，以达到去广告、去无用信息的优化。

## 安装并配置 GKD

> 功能：自动点击“跳过”按钮，秒进 App 主页面。

### 下载 GKD

- 官方网页下载：[开始使用 | GKD](https://gkd.li/guide/)
- GitHub Releases（需科学上网）：[https://github.com/gkd-kit/gkd/releases](https://github.com/gkd-kit/gkd/releases)
- Google Play：[GKD - 自定义屏幕点击应用 - Google Play 上的应用](https://play.google.com/store/apps/details?id=li.songe.gkd)

### 安装并授予无障碍权限

普通授权完全足够，不过我电脑刚好有 ADB 工具，我就用外部 ADB 工具授权了。

**普通授权**：

1. 安装后打开 GKD
2. 点击首页 **【服务状态】→【开启服务】**
3. 跳转到系统设置 → 找到 **“GKD”** → 开启 **“无障碍服务”**
    - 华为路径示例：`设置 → 辅助功能 → 无障碍 → 已下载的应用 → GKD → 开启`
4. 返回 GKD，确认状态显示 **“已启用”**

**ADB 授权**：

- 有一台安装了 ADB 的电脑。
- 手机进入设置开启调试模式

![](https://raw.githubusercontent.com/wmjim/blogimages/main/20251212182452276.png)

- 在电脑 cmd 中运行如下命令

```bash
adb shell sh /storage/emulated/0/Android/data/li.songe.gkd/files/sh/start.sh
```

![](https://raw.githubusercontent.com/wmjim/blogimages/main/20251212182517533.png)

高级授权完成后的样子：

![](https://raw.githubusercontent.com/wmjim/blogimages/main/20251212182537348.png)

### 订阅最新广告跳过规则

[GKD_THS_List](https://github.com/Adpro-Team/GKD_THS_List)：Adpro-Team 整理的GKD第三方订阅列表

在 GKD 中点击底部 **【订阅】→ 右下角【+】，**粘贴以下任一规则链接**（推荐全部添加）：**

```markdown
# AIsouler 规则（最全）
https://registry.npmmirror.com/@aisouler/gkd_subscription/latest/files/dist/AIsouler_gkd.json5

# Adpro-Team 规则（热门 App 优化）
https://registry.npmmirror.com/@adpro/gkd_subscription/latest/files/dist/Adpro_gkd.json5
```

等待几秒，显示“订阅成功”

此时 GKD 已可自动跳过大多数 App 的开屏广告！

### 锁定后台（防杀）

为防止被系统杀后台，请进入 ：

手机管家 → 应用启动管理 → 找到 GKD → 关闭“自动管理” → 手动开启“允许后台活动”、“允许自启动”

## 安装并配置 AdGuard

> **功能**：屏蔽 Banner、弹窗、视频贴片、推送广告（基于网络请求过滤）
> 

### 下载 AdGuard

- 官方（推荐）：[AdGuard 是全球最先进的广告拦截器！享受到最佳无广告体验](https://adguard.com/zh_cn/welcome.html)

> 📌 免费版已足够使用，无需购买高级版
> 

### 设置

1. 安装后打开 AdGurad
2. 点击 **【开始保护】** → 允许创建 VPN 连接（这是正常行为，用于过滤流量）
3. 系统弹出权限请求 → 点击 **【确定】**

### 启用 DNS 并添加中文规则

默认已经启用 DNS 过滤，点击下方左数第二个盾牌图标，将免费能打开的都打开。

然后点击 DNS 保护功能，进入 DNS 过滤器，添加 DNS 过滤器：

```markdown
# 名称填：秋空去广告规则
# 此规则专为中文环境优化，可屏蔽大量国产 App 广告
https://anti-ad.net/adguard.txt
```

点击 **【添加】**，等待加载完成并启用。

### 锁定后台（防杀）

为防止被系统杀后台，请进入 ：

手机管家 → 应用启动管理 → 找到 GKD → 关闭“自动管理” → 手动开启“允许后台活动”、“允许自启动”

### 兼容 VPN

在安卓设备上开启其他 VPN（如科学上网工具、公司内网、游戏加速器等）时，AdGuard 会自动停止工作。

> AdGuard 正是通过创建一个本地虚拟 VPN 来实现网络过滤（拦截广告请求）。
Android 系统出于安全和网络路由的考虑，**不允许同时运行多个基于 VPN 接口的应用**。
> 

如果你使用的是支持规则过滤的代理工具，可以直接在其中集成广告过滤规则，而无需再使用 AdGuard。

以 Clash Meta 为例：

1. 打开 Clash Meta 配置文件
2. 在 rules 或 rule-providers 中添加广告过滤规则：

```markdown
rule-providers:
  anti-ad:
    type: http
    behavior: classical
    url: "https://anti-ad.net/clash.yaml"
    path: ./rules/anti-ad.yaml
    interval: 86400

rules:
  - RULE-SET,anti-ad,REJECT
  # 其他规则...
```

1. 保存并更新配置
2. 启动 Clash Meta → 广告 + 翻墙/加速，一并解决

不过由于本人使用的是另一款不是很高级的梯子工具，还充了年费，暂时这里就不做更多修改。

## 关闭广告 & 通知

1. **设置 → 通知 → 通知管理**
2. 对于一些不关键的 APP 关闭 **“允许通知”**：
3. 对于必须用的 App（如微信），可进入其内部设置 → 关闭“服务号通知”、“朋友圈广告”等

## 额外建议

此外还可以安装一些纯净版本的软件以达到系统使用干净的效果：

- [APKMirror](https://www.apkmirror.com/)：官方签名，较安全
- GitHub 上的“纯净版”项目

现在开始享用一个干净的手机系统吧！！！