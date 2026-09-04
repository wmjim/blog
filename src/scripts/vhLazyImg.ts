// 图片懒加载
import LazyLoad from "vanilla-lazyload";

// 正文图片类名：交由下方自定义「预载测尺寸→撑占位盒→换源」逻辑，
// 卡片缩略图/头像等已有固定尺寸盒子的图片仍走 vanilla-lazyload
const ARTICLE_IMG = "img.vh-article-img[data-vh-lz-src]";
const IMG_SELECTOR = "img:not(.view-image-container):not(.vh-article-img)";

let lazyLoadStatus: any = null;
let articleObserver: IntersectionObserver | null = null;

// 依据真实图自然宽高 + CSS 约束（max-width:100% / max-height:36rem），算出最终显示盒并撑起占位
const reserveBox = (el: any, naturalW: number, naturalH: number) => {
  if (!naturalW || !naturalH) return;
  // getComputedStyle 会把 rem 换算为 px，可直接取
  const maxH = parseFloat(getComputedStyle(el).maxHeight) || 0;
  // 可用宽度：以最近块级父元素为准，缺失时回退正文容器/视口
  let availW = el.parentElement?.clientWidth
    || document.querySelector(".main-inner-content")?.clientWidth
    || window.innerWidth;
  let dispW = Math.min(naturalW, availW);
  let dispH = (dispW * naturalH) / naturalW;
  if (maxH && dispH > maxH) {
    dispH = maxH;
    dispW = (dispH * naturalW) / naturalH;
  }
  el.style.width = `${dispW}px`;
  el.style.height = `${dispH}px`;
};

// 先预载原图拿到固有尺寸，撑起与最终布局一致的盒再换 src，消除加载瞬间的布局偏移
const loadArticleImg = (el: any) => {
  const realSrc = el.getAttribute("data-vh-lz-src");
  if (!realSrc) return;
  // 真实图解码完成/失败后：移除内联尺寸（数值与预留一致，无回跳），交由 CSS 自然布局并取消模糊
  el.addEventListener("load", () => {
    el.classList.add("loaded");
    el.style.width = "";
    el.style.height = "";
  }, { once: true });
  el.addEventListener("error", () => {
    el.classList.add("loaded");
    el.style.width = "";
    el.style.height = "";
  }, { once: true });

  const probe = new Image();
  probe.onload = () => {
    reserveBox(el, probe.naturalWidth, probe.naturalHeight);
    el.src = realSrc;
  };
  probe.onerror = () => {
    el.src = realSrc;
  };
  probe.src = realSrc;
};

// 正文图片：单独 IntersectionObserver 驱动
const initArticleLazy = () => {
  const imgs: any[] = [...document.querySelectorAll(ARTICLE_IMG)];
  if (!("IntersectionObserver" in window) || !imgs.length) return;
  articleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el: any = entry.target;
      articleObserver?.unobserve(el);
      loadArticleImg(el);
    });
  }, { rootMargin: "200px 0px" });
  imgs.forEach((img) => articleObserver?.observe(img));
};

// 初始化图片懒加载
export default () => {
  // 未标记的通用图片：补上占位图标记（正文图片构建期已注入，无需处理）
  document.querySelectorAll(".main-inner>.main-inner-content img:not(.view-image-container):not(.vh-article-img)").forEach((i: any) => {
    if (!i.hasAttribute("data-vh-lz-src")) {
      i.setAttribute("data-vh-lz-src", i.getAttribute("src"));
      i.setAttribute("src", "/blog/assets/images/lazy-loading.webp");
    }
  });
  // 卡片缩略图/头像等固定盒图片维持原 lazy-load 行为
  if (!lazyLoadStatus) {
    lazyLoadStatus = new LazyLoad({ elements_selector: IMG_SELECTOR, threshold: 200, data_src: "vh-lz-src" });
  } else {
    lazyLoadStatus.update();
  }
  // Swup 翻页后重建观察器，避免旧页未加载完的图残留引用
  articleObserver?.disconnect();
  articleObserver = null;
  // 正文图片走测尺寸预留流程
  initArticleLazy();
}