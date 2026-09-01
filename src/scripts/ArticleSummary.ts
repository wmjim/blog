// 文章总结打字机效果：进入文章页时逐字揭示 AI 生成的 summary
// 服务端已完整渲染文本（SEO + 无 JS 降级），本脚本仅做打字动画
const TYPE_SPEED = 45; // 每打一字的间隔（毫秒）
const START_DELAY = 350; // 等待 swup 页面进入动画后再开始

const articleSummaryInit = () => {
  const el = document.querySelector<HTMLElement>('.article-summary-text');
  if (!el) return;
  // swup 页面切换会重复初始化，用标记跳过
  if (el.dataset.typed === 'true') return;
  el.dataset.typed = 'true';

  const fullText = (el.textContent || '').trim();
  if (!fullText) return;

  // 用户偏好减少动态效果时直接展示全文（文本已在 HTML 中渲染，无需处理）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const container = el.closest<HTMLElement>('.article-summary');
  el.textContent = '';

  let index = 0;
  const run = () => {
    if (index < fullText.length) {
      el.textContent = fullText.substring(0, index + 1);
      index += 1;
      setTimeout(run, TYPE_SPEED);
    } else {
      // 输入完毕，光标淡出
      container?.classList.add('is-done');
    }
  };
  setTimeout(run, START_DELAY);
};

export default articleSummaryInit;
