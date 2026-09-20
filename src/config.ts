export default {
  // 网站标题
  Title: "Void",
  // 网站地址
  Site: 'https://wmjim.github.io/blog',
  // 网站副标题
  Subtitle: 'Hello, World!',
  // 网站描述
  Description: '专注于分享和总结，记录我的学习、感想和生活点滴.',
  // 网站作者
  Author: 'Void',
  // 作者头像
  Avatar: import.meta.env.BASE_URL + 'assets/images/avator.jpg',
  // 网站座右铭
  Motto: 'Be the change you wish to see in the world.',
  // 网站侧边栏公告 (不填写即不开启)
  Tips: '<p>欢迎光临我的博客 🎉</p><p>这里会分享我的日常和学习中的收集、整理及总结，希望能对你有所帮助:) 💖</p>',
  // 网站创建时间
  CreateTime: '2023-09-01',
  // 博客主题配置
  Theme: {
    // 颜色请用 16 进制颜色码
    // 主题颜色 — 暖橙，用于站点名与各级标题（对比度 5.2:1，正文尺寸也可读）
    "--vh-main-color": "#C2410C",
    // 字体颜色 — 近黑正文
    "--vh-font-color": "#333333",
    // 侧边栏宽度
    "--vh-aside-width": "300px",
    // 全局圆角 — 近乎直角，层次交给细线与留白
    "--vh-main-radius": "0.25rem",
    // 主体内容宽度
    "--vh-main-max-width": "1400px",
  },
  // 导航栏 (新窗口打开 newWindow: true)
  Navs: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: '归档', link: '/archives', icon: 'Nav_archives' },
    { text: '分类', link: '/categories', icon: 'Nav_categories' },
    { text: '标签', link: '/tags', icon: 'Nav_tags' },
    { text: '朋友', link: '/links', icon: 'Nav_friends' },
    { text: '动态', link: '/talking', icon: 'Nav_talking' },
    { text: '留言', link: '/message', icon: 'Nav_message' },
    { text: '关于', link: '/about', icon: 'Nav_about' },
  ],
  // 侧边栏个人网站
  WebSites: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: 'Github', link: 'https://github.com/wmjim', icon: 'WebSite_github' },
    { text: 'X', link: 'https://x.com/Voidy7rp', icon: 'WebSite_x' },
    { text: 'Email', link: 'mailto:meng.w1016@outlook.com', icon: 'WebSite_email' },
    { text: 'HanAnalytics', link: 'https://analytics.vvhan.com', icon: 'WebSite_analytics' },
  ],
  // 侧边栏展示
  AsideShow: {
    // 是否展示个人网站
    WebSitesShow: true,
    // 是否展示推荐文章
    recommendArticleShow: true
  },
  // DNS 预解析（preconnect）：仅保留当前构建中实际会请求的域名。
  // 其余域名随对应功能开关启用时再加回：
  //   评论头像 cn.cravatar.com（Waline/Twikoo）· 广告 pagead2.googlesyndication.com · 统计 analytics.vvhan.com
  //   音乐 vh-api.4ce.cn · 直链视频 hls/dplayer registry.npmmirror.com · 动态 i0.wp.com
  DNSOptimization: [
    'https://raw.githubusercontent.com',
  ],
  // 博客音乐组件解析接口
  vhMusicApi: 'https://vh-api.4ce.cn/blog/meting',
  // 评论组件（只允许同时开启一个）
  Comment: {
    // Twikoo 评论
    Twikoo: {
      enable: false,
      envId: ''
    },
    // Waline 评论
    Waline: {
      enable: true,
      serverURL: 'https://blog-comments-9u7m.vercel.app/'
    }
  },
  // Han Analytics 统计（https://github.com/uxiaohan/HanAnalytics）
  HanAnalytics: { enable: false, server: 'https://analytics.vvhan.com', siteId: 'Hello-HanHexoBlog' },
  // Google 广告
  GoogleAds: {
    ad_Client: '', //ca-pub-xxxxxx
    // 侧边栏广告(不填不开启)
    asideAD_Slot: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-xxxxxx" data-ad-slot="xxxxxx" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
    // 文章页广告(不填不开启)
    articleAD_Slot: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-xxxxxx" data-ad-slot="xxxxxx" data-ad-format="auto" data-full-width-responsive="true"></ins>`
  },
  // 文章内赞赏码
  Reward: {
    // 支付宝收款码
    AliPay: import.meta.env.BASE_URL + 'assets/images/PayQrcode.png',
    // 微信收款码
    WeChat: import.meta.env.BASE_URL + 'assets/images/PayQrcode.png'
  },
  // 访问网页 自动推送到搜索引擎
  SeoPush: {
    enable: false,
    serverApi: '',
    paramsName: 'url'
  }
}