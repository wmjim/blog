// 博客亮色 Mermaid 主题 — 与整体浅色风格和谐统一
const LIGHT_VARS = {
  // 主色调：博客强调色（柔和青蓝），用于箭头、边框、标题等
  primaryColor: '#5B889C',
  primaryTextColor: '#ffffff',
  primaryBorderColor: '#4A7A8E',
  // 线条与结构色
  lineColor: '#DDE1E7',
  secondaryColor: '#F4F6F8',
  tertiaryColor: '#ffffff',
  background: '#ffffff',
  // 节点背景：极浅青灰，带一丝博客强调色的温度
  mainBkg: '#EDF2F4',
  secondBkg: '#F4F6F8',
  border1: '#EBEEF2',
  border2: '#C5CDD5',
  // 文字色：与博客正文字色一致
  textColor: '#1E2D3D',
  nodeBorder: '#DDE1E7',
  arrowheadColor: '#5B889C',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
  fontSize: '14px',
  // 备注区块
  noteBkgColor: '#EEF4F6',
  noteTextColor: '#3A697A',
  noteBorderColor: '#9DBFCC',
  labelBackground: '#ffffff',
  labelTextColor: '#1E2D3D',
  // Actor / Sequence 图
  actorBkg: '#EDF2F4',
  actorBorder: '#5B889C',
  actorTextColor: '#1E2D3D',
  actorLineColor: '#DDE1E7',
  signalColor: '#1E2D3D',
  signalTextColor: '#1E2D3D',
  sectionBkgColor: '#F4F6F8',
  // Task / Gantt 图
  taskBkgColor: '#EDF2F4',
  taskBorderColor: '#5B889C',
  taskTextColor: '#1E2D3D',
  // 类图等
  classText: '#1E2D3D',
  labelColor: '#1E2D3D',
};

// 博客暗色 Mermaid 主题 — 与整体暗色风格和谐统一
const DARK_VARS = {
  // 主色调：在暗色背景下适当提亮强调色，保持可辨识度
  primaryColor: '#7AB4C4',
  primaryTextColor: '#16161E',
  primaryBorderColor: '#7AB4C4',
  // 线条与结构色：与博客暗色边框体系对齐
  lineColor: '#3D3D52',
  secondaryColor: '#1E1E2A',
  tertiaryColor: '#16161E',
  background: '#1E1E2A',
  // 节点背景：深色基底上微微混入青蓝色调
  mainBkg: '#1F2A32',
  secondBkg: '#1E1E2A',
  border1: '#2D2D3F',
  border2: '#4A4D5E',
  // 文字色：与博客暗色正文字色一致
  textColor: '#E0E0E8',
  nodeBorder: '#3D3D52',
  arrowheadColor: '#7AB4C4',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
  fontSize: '14px',
  // 备注区块
  noteBkgColor: '#1B2630',
  noteTextColor: '#8BB8C6',
  noteBorderColor: '#7AB4C4',
  labelBackground: '#1E1E2A',
  labelTextColor: '#E0E0E8',
  // Actor / Sequence 图
  actorBkg: '#1F2A32',
  actorBorder: '#7AB4C4',
  actorTextColor: '#E0E0E8',
  actorLineColor: '#3D3D52',
  signalColor: '#E0E0E8',
  signalTextColor: '#E0E0E8',
  sectionBkgColor: '#1E1E2A',
  // Task / Gantt 图
  taskBkgColor: '#1F2A32',
  taskBorderColor: '#7AB4C4',
  taskTextColor: '#E0E0E8',
  // 类图等
  classText: '#E0E0E8',
  labelColor: '#E0E0E8',
};

function getMermaidConfig() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  return {
    theme: 'base',
    themeVariables: isDark ? DARK_VARS : LIGHT_VARS,
    startOnLoad: false,
    securityLevel: 'strict',
    flowchart: { useMaxWidth: true, htmlLabels: true },
    sequence: { useMaxWidth: true },
    gantt: { useMaxWidth: true },
  };
}

// 保存原始 mermaid 代码（仅首次）
function saveOriginalCode() {
  document.querySelectorAll<HTMLPreElement>('pre.mermaid').forEach((el) => {
    if (!el.dataset.mermaidCode) {
      el.dataset.mermaidCode = el.textContent || '';
    }
  });
}

// 渲染所有 mermaid 图表（动态加载 mermaid 库，仅在页面包含图表时加载）
async function renderMermaid() {
  const nodes = document.querySelectorAll<HTMLElement>('pre.mermaid');
  if (!nodes.length) return;
  saveOriginalCode();
  const mermaidMod = await import('mermaid');
  const mermaid = mermaidMod.default ?? mermaidMod;
  mermaid.initialize(getMermaidConfig());
  await mermaid.run({
    nodes,
    suppressErrors: true,
  });
}

let themeObserverReady = false;

// 监听主题切换，用新主题重新渲染所有图表
function watchTheme() {
  if (themeObserverReady) return;
  themeObserverReady = true;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        // 将已渲染的 SVG 还原为原始 mermaid 代码
        document.querySelectorAll<HTMLPreElement>('pre.mermaid').forEach((el) => {
          if (el.dataset.mermaidCode) {
            el.innerHTML = '';
            el.textContent = el.dataset.mermaidCode;
            // 移除 data-processed 属性，否则 mermaid.run() 会跳过已处理过的元素
            el.removeAttribute('data-processed');
          }
        });
        renderMermaid();
        break;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

export default async function mermaidInit() {
  try {
    await renderMermaid();
    watchTheme();
  } catch (e) {
    console.warn('Mermaid 图表渲染失败:', e);
  }
}
