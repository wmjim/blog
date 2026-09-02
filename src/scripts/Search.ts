import { $GET } from '@/utils/index'

// 更新数据
let searchJson: any[] = [];
const getSearchJson = async () => (searchJson = await $GET(import.meta.env.BASE_URL + 'vh-search.json'))

// 搜索
const searchFn = async (value: string) => {
  if (!searchJson.length) await getSearchJson();
  // 渲染页面
  renderSearch(findAndModifyElements(searchJson, value), value)
}

// HTML 转义：关键词最终会拼入 innerHTML，必须转义防止注入
// 映射顺序无关，注意 & 要最先处理（否则 &lt; 会被二次转义）
const escapeHTML = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

// 高亮关键词：将文本中匹配的关键词包裹到 <span> 标签（正则特殊字符已转义）
const highlightKeyword = (text: string, keyword: string) =>
  text.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), `<span class="vh-hl">${escapeHTML(keyword)}</span>`);

// 关键词匹配
const findAndModifyElements = (arr: any[], keyword: string) => {
  if ((keyword || '') == '') return []
  return arr
    .filter(item => item.content.includes(keyword))
    .map(item => {
      const content = item.content;
      const keywordIndex = content.indexOf(keyword);
      const start = Math.max(0, keywordIndex - 50);
      const end = Math.min(content.length, keywordIndex + keyword.length + 50);
      return {
        ...item,
        // 标题与摘要同时高亮关键词
        title: highlightKeyword(item.title, keyword),
        content: highlightKeyword(content.substring(start, end), keyword)
      };
    });
}

// 渲染页面
let searchHTML = '';
const renderSearch = (arr: any[], keyword: string = '') => {
  searchHTML = !arr.length ? '<em></em>' : arr.map(i => `<a class="vh-search-item" href="${i.url}${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}"><span class="vh-ellipsis">${i.title}</span><p class="vh-ellipsis line-3">${i.content}</p></a>`).join('');
  document.querySelector('.vh-header>.main>.vh-search>main>.vh-search-list')!.innerHTML = searchHTML;
  // 重置键盘选中索引
  searchSelectIndex = -1;
}

// 截流
let fnTimer: any = null;
const searchInputChange = (v: any) => {
  const value = v.target.value;
  if (fnTimer) clearTimeout(fnTimer);
  fnTimer = setTimeout(() => searchFn(value), 266);
}

// 清空搜索输入并重置结果列表（每次打开搜索时调用）
const resetSearch = () => {
  const panel: any = document.querySelector(".vh-header>.main>.vh-search");
  if (!panel) return;
  const input = panel.querySelector(".search-input>input");
  if (input) input.value = "";
  renderSearch([]);
};

// 打开搜索面板并聚焦输入框
const openSearch = () => {
  const panel: any = document.querySelector(".vh-header>.main>.vh-search");
  if (!panel) return;
  resetSearch();
  panel.classList.add("active");
  panel.querySelector(".search-input>input").focus();
};

// 键盘快捷键（全局仅绑定一次，DOM 随页面切换实时查询）
let keyShortcutInit = false;
// 当前键盘选中的搜索候选项索引（-1 表示未选中）
let searchSelectIndex = -1;

// 选中/取消选中搜索候选项
const selectSearchItem = (panel: any, index: number) => {
  const items = panel.querySelectorAll(".vh-search-item");
  items.forEach((item: any, i: number) => item.classList.toggle("selected", i === index));
  const target = items[index];
  if (target) target.scrollIntoView({ block: "nearest" });
  searchSelectIndex = index;
};

const initKeyShortcut = () => {
  if (keyShortcutInit) return;
  keyShortcutInit = true;
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const panel: any = document.querySelector(".vh-header>.main>.vh-search");
    const isOpen = !!panel && panel.classList.contains("active");

    // ESC：退出搜索面板
    if (e.key === "Escape") {
      if (panel && isOpen) {
        panel.classList.remove("active");
        const input = panel.querySelector(".search-input>input");
        if (input) input.blur();
      }
      return;
    }

    // 搜索面板打开时：上下键选择候选项，回车跳转
    if (isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      const items = panel.querySelectorAll(".vh-search-item");
      if (!items.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectSearchItem(panel, searchSelectIndex < 0 ? 0 : (searchSelectIndex + 1) % items.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        selectSearchItem(panel, searchSelectIndex <= 0 ? items.length - 1 : searchSelectIndex - 1);
        return;
      }
      // Enter：跳转到选中的文章
      e.preventDefault();
      items[searchSelectIndex < 0 ? 0 : searchSelectIndex].click();
      return;
    }

    if (e.key.toLowerCase() !== "f") return;
    // 仅纯 F 键触发站内搜索；Ctrl/Cmd+F 放行给浏览器原生"页面内查找"
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
    if (panel && isOpen) return;
    e.preventDefault();
    openSearch();
  });
};

// 从 URL 定位搜索关键词：高亮并滚动到文章正文首次出现处
const vhSearchJumpInit = () => {
  const keyword = new URLSearchParams(location.search).get('keyword');
  if (!keyword) return;
  const article: any = document.querySelector('.vh-article-main');
  if (!article) return;
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      const parent = (node.parentNode as HTMLElement) || null;
      if (!parent) return NodeFilter.FILTER_REJECT;
      // 跳过代码块、链接、脚本等区域的文本，避免破坏结构
      if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'SVG', 'A'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const idx = node.textContent?.indexOf(keyword) ?? -1;
    if (idx === -1) continue;
    const range = document.createRange();
    range.setStart(node, idx);
    range.setEnd(node, idx + keyword.length);
    const span = document.createElement('span');
    span.className = 'vh-search-jump';
    span.textContent = keyword;
    range.deleteContents();
    range.insertNode(span);
    setTimeout(() => span.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
    // 清理 URL 上的关键词参数，避免刷新或再次进入时重复跳转
    history.replaceState(null, '', location.pathname + location.hash);
    break;
  }
};

// 初始化搜索框
const vhSearchInit = () => {
  const searchDOM: any = document.querySelector(".vh-header>.main>nav>span.search-btn");
  const searchMainDOM: any = document.querySelector(".vh-header>.main>.vh-search>main");
  const searchListDOM: any = document.querySelector(".vh-header>.main>.vh-search");
  const addActive = () => setTimeout(() => {
    resetSearch();
    searchListDOM.classList.add("active");
    searchListDOM.querySelector(".search-input>input").focus();
  });
  const removeActive = () => setTimeout(() => searchListDOM.classList.remove("active"));
  // 禁止默认事件
  searchMainDOM.addEventListener("click", (e: Event) => e.stopPropagation());
  searchDOM.addEventListener("click", addActive);
  searchListDOM.addEventListener("click", removeActive);
  // 搜索框初内容变化
  searchListDOM.querySelector(".search-input>input").addEventListener("input", searchInputChange);
  // 键盘快捷键：纯 F 打开站内搜索；Ctrl+F 已放行给浏览器原生"页面内查找"
  initKeyShortcut();
};

export { searchFn, searchInputChange, vhSearchInit, vhSearchJumpInit };