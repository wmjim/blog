// TOC 目录初始化 — 由 Init.ts 在每次页面切换时调用
// 形态：h2/h3 全量平铺常显（不折叠）；职责 = 构建目录 + 滚动高亮当前节 + 顶部阅读进度条
// 移动抽屉为全量索引，且打开时高亮与列表滚动实时跟随正在阅读的小节

interface TocItem {
	el: HTMLElement;
	level: 2 | 3;
	id: string;
	text: string;
}

// 模块级引用：Init.ts 与组件 <script> 可能各触发一次 initTOC，跨 swup 翻页旧实例会累积，
// 故观察器/兜底监听一律先清理再重建
let tocObserver: IntersectionObserver | null = null;
let fallbackCleanup: (() => void) | null = null;

// ===== 阅读进度条（模块级只绑定一次，随翻页保留） =====
let progressBound = false;
let progressRaf = 0;

const refreshProgress = () => {
	const bar = document.getElementById("vh-reading-progress");
	if (!bar) return;
	const doc = document.documentElement;
	const max = doc.scrollHeight - window.innerHeight;
	const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
	// 无独立坐标系的固定元素：仅用 scaleX 填充，避免每帧改 width 触发布局
	bar.style.transform = `scaleX(${p})`;
};

const scheduleProgress = () => {
	if (progressRaf) return;
	progressRaf = requestAnimationFrame(() => {
		progressRaf = 0;
		refreshProgress();
	});
};

const bindProgress = () => {
	if (progressBound) return;
	progressBound = true;
	window.addEventListener("scroll", scheduleProgress, { passive: true });
	window.addEventListener("resize", scheduleProgress);
	// 图片懒加载完成会改变文档高度，scroll 未触发时靠 load 兜底校准
	window.addEventListener("load", refreshProgress);
};

export function initTOC() {
	// 进度条元素仅存在于文章页（TOC.astro），其他页面 getElementById 为空即跳过
	bindProgress();
	refreshProgress();

	const tocList = document.getElementById("vh-toc-list") as HTMLUListElement | null;
	const tocNav = document.getElementById("vh-toc");
	if (!tocList || !tocNav) return;

	const article = document.querySelector("article.vh-article-main");
	if (!article) return;

	// 清理旧实例（重复调用 / swup 换页后的残留）
	tocObserver?.disconnect();
	tocObserver = null;
	fallbackCleanup?.();
	fallbackCleanup = null;

	const headings = article.querySelectorAll("h2, h3");
	if (headings.length === 0) {
		tocNav.style.display = "none";
		return;
	}

	// 解析标题，跳过文章页脚中的 UI 标题（如「相关文章」「版权」等）
	const items: TocItem[] = [];
	headings.forEach((heading) => {
		const h = heading as HTMLElement;
		if (h.closest("footer")) return;
		const level = (h.tagName === "H2" ? 2 : 3) as 2 | 3;
		let id = h.id;
		if (!id) {
			id = "toc-" + Math.random().toString(36).slice(2, 8);
			h.id = id;
		}
		items.push({ el: h, level, id, text: h.textContent || "" });
	});

	if (items.length < 2) {
		tocNav.style.display = "none";
		return;
	}

	// 确保可见
	tocNav.style.display = "";

	// 清空旧列表（幂等）
	tocList.innerHTML = "";

	// 构建扁平列表：h2/h3 全部常显，h3 靠缩进层级区分
	const fragment = document.createDocumentFragment();
	const allLinks: HTMLAnchorElement[] = [];

	for (const item of items) {
		const li = document.createElement("li");
		li.className = `vh-toc-item vh-toc-level-${item.level}`;
		const a = document.createElement("a");
		a.href = `#${item.id}`;
		a.textContent = item.text;
		a.dataset.target = item.id;
		a.addEventListener("click", (e) => {
			e.preventDefault();
			const target = document.getElementById(item.id);
			if (target) {
				const top = target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - 20;
				window.scrollTo({ top, behavior: "smooth" });
			}
		});
		li.appendChild(a);
		fragment.appendChild(li);
		allLinks.push(a);
	}

	tocList.appendChild(fragment);

	let currentActiveId = "";

	// 抽屉元素（仅文章页存在；桌面窄屏下按钮/遮罩在 DOM 中但未激活）
	const mobileBtn = document.getElementById("toc-mobile-btn");
	const tocOverlay = document.getElementById("toc-overlay");
	const overlayContent = document.getElementById("toc-overlay-content");

	// 移动抽屉正打开时，把桌面列表的 active 高亮同步过去，并让抽屉内滚动跟随当前小节
	// 注：匹配项用 find 表达式取（闭包内赋值 TS 无法追踪会误判 never）
	const syncOverlayActive = (id: string) => {
		if (!tocOverlay?.classList.contains("active") || !overlayContent) return;
		overlayContent.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
			a.classList.toggle("active", a.dataset.target === id);
		});
		const matched = Array.from(overlayContent.querySelectorAll<HTMLAnchorElement>("a")).find(
			(a) => a.dataset.target === id,
		);
		if (!matched) return;
		overlayContent.scrollTo({
			top: matched.offsetTop - overlayContent.clientHeight / 3,
			behavior: "smooth",
		});
	};

	const applyActive = (id: string) => {
		if (id === currentActiveId) return;
		currentActiveId = id;
		allLinks.forEach((link) => {
			link.classList.toggle("active", link.dataset.target === id);
		});
		const activeLink = allLinks.find((l) => l.dataset.target === id);
		if (activeLink) {
			tocList.scrollTo({
				top: activeLink.offsetTop - tocList.clientHeight / 3,
				behavior: "smooth",
			});
		}
		// 抽屉打开时随阅读位置滚动突出当前标题
		syncOverlayActive(id);
	};

	// =========================================================
	// 滚动追踪（IntersectionObserver）
	// =========================================================
	// 用 typeof 判定而非 "in window"：DOM lib 将 IntersectionObserver 声明为 Window 必需属性，
	// "in window" 会让 else 分支把 window 窄化成 never（潜伏 TS 错，astro build 不查类型故未暴露）
	if (typeof IntersectionObserver !== "undefined") {
		tocObserver = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) applyActive(visible[0].target.id);
			},
			{ rootMargin: `-${HEADER_HEIGHT + 20}px 0px -60% 0px` },
		);
		items.forEach((item) => tocObserver?.observe(item.el));

		// 移动端 TOC 按钮事件（抽屉跟随逻辑见 syncOverlayActive）
		if (mobileBtn && tocOverlay && overlayContent) {
			const overlayClose = document.getElementById("toc-overlay-close");
			mobileBtn.addEventListener("click", () => {
				overlayContent.innerHTML = tocList.innerHTML;
				// 重新绑定 overlay 中的链接事件
				overlayContent.querySelectorAll("a").forEach((a) => {
					a.addEventListener("click", (e) => {
						e.preventDefault();
						const targetId = (a as HTMLAnchorElement).dataset.target;
						if (targetId) {
							const target = document.getElementById(targetId);
							if (target) {
								const top = target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - 20;
								window.scrollTo({ top, behavior: "smooth" });
							}
						}
						tocOverlay.classList.remove("active");
					});
				});
				tocOverlay.classList.add("active");
				// 打开瞬间把当前高亮/抽屉滚动位置同步到位；之后的滚动由 applyActive→syncOverlayActive 跟进
				syncOverlayActive(currentActiveId);
			});
			if (overlayClose) {
				overlayClose.addEventListener("click", () => tocOverlay.classList.remove("active"));
			}
			tocOverlay.addEventListener("click", (e) => {
				if (e.target === tocOverlay) tocOverlay.classList.remove("active");
			});
		}
	} else {
		// 无 IO 兜底：滚动位置推算 active
		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				let activeId = "";
				for (const item of items) {
					if (item.el.getBoundingClientRect().top < HEADER_HEIGHT + 20 + 80) {
						activeId = item.id;
					}
				}
				if (activeId) applyActive(activeId);
				ticking = false;
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		fallbackCleanup = () => window.removeEventListener("scroll", onScroll);
	}
}

// Header 高（px）——与 Header.less --vh-header-height 同步
const HEADER_HEIGHT = 3.25 * 16;
