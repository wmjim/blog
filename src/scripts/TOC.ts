// TOC 目录初始化 — 由 Init.ts 在每次页面切换时调用

interface TocItem {
	el: HTMLElement;
	level: 2 | 3;
	id: string;
	text: string;
}

export function initTOC() {
	const tocList = document.getElementById("vh-toc-list") as HTMLUListElement | null;
	const tocNav = document.getElementById("vh-toc");
	if (!tocList || !tocNav) return;

	const article = document.querySelector("article.vh-article-main");
	if (!article) return;

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

	// 构建扁平列表
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
				const headerH = 3.25 * 16;
				const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
				window.scrollTo({ top, behavior: "smooth" });
			}
		});

		li.appendChild(a);
		fragment.appendChild(li);
		allLinks.push(a);
	}

	tocList.appendChild(fragment);

	// =========================================================
	// 滚动追踪
	// =========================================================
	const headerHeight = 3.25 * 16 + 20;

	if ("IntersectionObserver" in window) {
		let currentActiveId = "";

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				if (visible.length > 0) {
					const newId = visible[0].target.id;
					if (newId !== currentActiveId) {
						currentActiveId = newId;
						allLinks.forEach((link) => {
							link.classList.toggle("active", link.dataset.target === newId);
						});

						const activeLink = allLinks.find((l) => l.dataset.target === newId);
						if (activeLink) {
							tocList.scrollTo({
								top: activeLink.offsetTop - tocList.clientHeight / 3,
								behavior: "smooth",
							});
						}
					}
				}
			},
			{ rootMargin: `-${headerHeight}px 0px -60% 0px` },
		);

		items.forEach((item) => observer.observe(item.el));

		// 移动端 TOC 按钮事件
		const mobileBtn = document.getElementById("toc-mobile-btn");
		const overlay = document.getElementById("toc-overlay");
		const overlayClose = document.getElementById("toc-overlay-close");
		const overlayContent = document.getElementById("toc-overlay-content");

		if (mobileBtn && overlay && overlayContent && overlayClose) {
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
								const headerH = 3.25 * 16;
								const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
								window.scrollTo({ top, behavior: "smooth" });
							}
						}
						overlay.classList.remove("active");
					});
				});
				overlay.classList.add("active");
			});
			overlayClose.addEventListener("click", () => overlay.classList.remove("active"));
			overlay.addEventListener("click", (e) => {
				if (e.target === overlay) overlay.classList.remove("active");
			});
		}

		window.addEventListener("beforeunload", () => {
			items.forEach((item) => observer.unobserve(item.el));
			observer.disconnect();
		}, { once: true });
	} else {
		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					let activeId = "";
					for (const item of items) {
						if (item.el.getBoundingClientRect().top < headerHeight + 80) {
							activeId = item.id;
						}
					}
					if (activeId) {
						allLinks.forEach((link) => {
							link.classList.toggle("active", link.dataset.target === activeId);
						});
					}
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("beforeunload", () => {
			window.removeEventListener("scroll", onScroll);
		}, { once: true });
	}
}
