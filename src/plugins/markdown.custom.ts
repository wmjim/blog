// src/plugins/remark-note.js
import { visit } from 'unist-util-visit';
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

// GitHub 风格 Note 标题映射
const NOTE_TITLES: Record<string, string> = {
  info: '信息',
  success: '成功',
  warning: '警告',
  error: '错误',
  import: '重要',
};

// GitHub callout 类型映射（GitHub 类型 → 内部 note 类型）
const GITHUB_TYPE_MAP: Record<string, string> = {
  note: 'info',
  tip: 'success',
  important: 'import',
  warning: 'warning',
  caution: 'error',
  info: 'info',
  success: 'success',
  import: 'import',
  error: 'error',
};

// 创建 title 段落 MDAST 节点
function createNoteTitleParagraph(type: string, customTitle?: string): any {
  const titleText = customTitle || NOTE_TITLES[type] || type;
  return {
    type: 'paragraph',
    data: { hProperties: { class: 'vh-note-title' } },
    children: [{ type: 'text', value: titleText }],
  };
}

// 处理标签
const remarkNote = () => {
  return (tree: any, { data: astroData }: any) => {
    visit(tree, (node) => {
      const { type, name, attributes } = node;
      // 处理组件
      if (type == 'textDirective' || type == 'leafDirective' || type == 'containerDirective') {
        // 设置 HTML 标签和 class
        const data = node.data || (node.data = {});
        const hProperties = data.hProperties || (data.hProperties = {});
        // 根据指令类型设置标签
        data.hName = name == 'btn' ? 'a' : 'section';
        // 这是 a 标签
        attributes.link && (hProperties.href = attributes.link);
        // 校验相册元素
        if (name == 'picture') {
          node.children = node.children.flatMap((child: any) => (child.type === 'paragraph' ? child.children : child));
        }
        // 处理 video/music/livephoto 等 vh 组件
        if (name.startsWith('vh')) {
          Object.keys(node.attributes).forEach((i: any) => (hProperties[`data-${i}`] = node.attributes[i]));
        }
        // 处理 github 仓库卡片组件
        if (name === 'github') {
          Object.keys(node.attributes).forEach((i: any) => (hProperties[`data-${i}`] = node.attributes[i]));
        }
        // 设置 class
        hProperties.class = `vh-node vh-${name}${attributes.type ? ` ${name}-${attributes.type}` : ''}`;
        // 为 note 组件添加 GitHub 风格的标题段落
        if (name === 'note' && attributes.type) {
          node.children.unshift(createNoteTitleParagraph(attributes.type));
        }
        // 文章字数统计
        const textOnPage = toString(tree);
        const readingTime = getReadingTime(textOnPage);
        astroData.astro.frontmatter.reading_time = readingTime.minutes
        astroData.astro.frontmatter.article_word_count = readingTime.words
      }
    });
  };
}

// 递归获取 HAST 元素的纯文本内容
function getElementText(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') {
    return (node.children || []).map((c: any) => getElementText(c)).join('');
  }
  return '';
}

// 处理 > [!info] 块引用语法 — 在 rehype 阶段将 <blockquote> 转为 GitHub 风格 note
const rehypeGithubCallout = () => {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | null, parent: any) => {
      if (node.tagName !== 'blockquote') return;
      if (!parent || index === null) return;

      const children = node.children || [];
      if (children.length === 0) return;

      // 找到第一个 <p> 子元素
      const firstP = children.find((c: any) => c.tagName === 'p');
      if (!firstP) return;

      // 获取第一个 <p> 的完整文本内容
      const textContent = getElementText(firstP);
      if (!textContent) return;

      // 匹配 [!TYPE] 或 [!type]（仅匹配行内空格/制表符，不吞换行）
      const calloutMatch = textContent.match(/^\[!(\w+)\][ \t]*/);
      if (!calloutMatch) return;

      const calloutType = calloutMatch[1].toLowerCase();
      const noteType = GITHUB_TYPE_MAP[calloutType];
      if (!noteType) return;

      // 去掉 [!TYPE] 标记，获取剩余文本
      const afterMarker = textContent.slice(calloutMatch[0].length);
      let customTitle: string | undefined;
      let bodyText = '';

      const newlineIdx = afterMarker.indexOf('\n');
      if (newlineIdx === 0) {
        // [!TYPE] 独占一行，内容从下一行开始
        bodyText = afterMarker.slice(1).trim();
      } else if (newlineIdx > 0) {
        // 换行前有文本 → 自定义标题，换行后为正文
        const possibleTitle = afterMarker.slice(0, newlineIdx).trim();
        if (possibleTitle) customTitle = possibleTitle;
        bodyText = afterMarker.slice(newlineIdx + 1).trim();
      } else {
        // 没有换行 → 若有余留文本则作为自定义标题（无额外正文）
        if (afterMarker.trim()) {
          customTitle = afterMarker.trim();
        }
      }

      // 构建新的 <section> 子元素
      const titleText = customTitle || NOTE_TITLES[noteType] || noteType;
      const newChildren: any[] = [
        {
          type: 'element',
          tagName: 'p',
          properties: { class: 'vh-note-title' },
          children: [{ type: 'text', value: titleText }],
        },
      ];

      // 只在有正文内容时添加 body 段落
      if (bodyText) {
        newChildren.push({
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{ type: 'text', value: bodyText }],
        });
      }

      // 用新的 <section> 替换原有的 <blockquote>
      const sectionNode: any = {
        type: 'element',
        tagName: 'section',
        properties: { class: `vh-node vh-note note-${noteType}` },
        children: newChildren,
      };

      parent.children.splice(index, 1, sectionNode);
    });
  };
};


// 解析平台视频 URL，返回 embed iframe 地址，不支持的平台返回 null
function getPlatformEmbed(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();

  // Bilibili: https://www.bilibili.com/video/BV... 或 https://www.bilibili.com/video/av...
  const biliMatch = url.match(/bilibili\.com\/video\/((?:BV|av)[\w]+)/i);
  if (biliMatch) {
    const vid = biliMatch[1];
    const timeMatch = url.match(/[?&]t=([\d.]+)/);
    const time = timeMatch ? `&t=${timeMatch[1]}` : '';
    return `//player.bilibili.com/player.html?bvid=${vid}&page=1${time}&high_quality=1&danmaku=0`;
  }

  // Bilibili 短链接: https://b23.tv/xxxxx — 需要跟随重定向，暂不支持
  // （b23.tv 需要实际请求才能获取真实地址，无法在构建时解析）

  // YouTube: https://www.youtube.com/watch?v=VIDEO_ID 或 https://youtu.be/VIDEO_ID
  let ytId: string | null = null;
  const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/i);
  if (ytWatchMatch) {
    ytId = ytWatchMatch[1];
  }
  if (ytId) {
    const timeMatch = url.match(/[?&]t=(\d+)s?/);
    const start = timeMatch ? `?start=${timeMatch[1]}` : '';
    return `https://www.youtube.com/embed/${ytId}${start}`;
  }

  return null;
}

//  处理 HTML 标签
const addClassNames = () => {
  return (tree: any) => {
    visit(tree, (node, index, parent) => {
      // 处理 a 标签
      if (node.tagName === 'a') {
        node.properties.target = '_blank', node.properties.rel = 'noopener nofollow'
        node.children = [{ type: 'element', tagName: 'span', children: node.children || [] }];
        // 处理 pre 标签
      } else if (node.tagName === 'pre') {
        const divNode = { type: 'element', tagName: 'section', properties: { class: 'vh-code-box' }, children: [{ type: 'element', tagName: 'span', properties: { class: 'vh-code-copy' } }, node] };
        // 替换父节点的 children 中的 pre 节点为新的 div 节点
        if (parent && index !== null) parent.children.splice(index, 1, divNode);
        // 处理 img 标签
      } else if (node.tagName === 'img') {
        // 添加 class 和 loading 属性
        node.properties.class = 'vh-article-img';
        node.properties['data-vh-lz-src'] = node.properties.src;
        node.properties.src = '/assets/images/lazy-loading.webp';
        // 处理 section 标签
      } else if (node.tagName === 'section') {
        if (node.properties.class && node.properties.class.includes('vh-vhVideo')) {
          const videoUrl = (node.properties['data-url'] || '') as string;
          const embedUrl = getPlatformEmbed(videoUrl);
          if (embedUrl) {
            // 平台视频（Bilibili / YouTube）→ 使用 iframe 嵌入
            node.properties.class += ' vh-video-embed';
            node.children = [{
              type: 'element',
              tagName: 'iframe',
              properties: {
                src: embedUrl,
                allowfullscreen: '',
                allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
                frameborder: '0',
                scrolling: 'no',
              },
              children: [],
            }];
          } else {
            // 直链视频文件 → 使用 DPlayer 播放器（保留加载占位）
            node.children = [{ type: 'element', tagName: 'section', properties: { class: 'vh-space-loading' }, children: [{ type: 'element', tagName: 'span' }, { type: 'element', tagName: 'span' }, { type: 'element', tagName: 'span' }] }];
          }
        }
      }
    });

  };
}

export { remarkNote, addClassNames, rehypeGithubCallout }
