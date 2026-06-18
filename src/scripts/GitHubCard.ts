// 初始化 GitHub 仓库信息卡片
interface GitHubRepo {
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  owner: {
    avatar_url: string;
    login: string;
  };
  license: {
    spdx_id: string;
  } | null;
  topics: string[];
}

// 语言颜色映射
const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Lua: '#000080',
  Dart: '#00B4AB',
  Zig: '#ec915c',
};

function getLangColor(lang: string): string {
  return LANG_COLORS[lang] || '#858585';
}

function formatCount(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(n);
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diff = Math.floor((now - past) / 1000);
  const days = Math.floor(diff / 86400);
  if (days < 1) return '今天';
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
}

// 简单内存缓存
const cache: Record<string, GitHubRepo> = {};

async function fetchRepo(repo: string): Promise<GitHubRepo | null> {
  if (cache[repo]) return cache[repo];

  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!resp.ok) {
      if (resp.status === 403) {
        console.warn('[GitHubCard] API rate limit exceeded for:', repo);
      }
      return null;
    }
    const data: GitHubRepo = await resp.json();
    cache[repo] = data;
    return data;
  } catch {
    return null;
  }
}

function buildCard(repo: GitHubRepo, element: HTMLElement): void {
  const licenseText = repo.license ? repo.license.spdx_id : '';
  const updatedAgo = timeAgo(repo.updated_at);

  element.classList.add('vh-github-loaded');
  element.innerHTML = `
    <a class="vh-github-card" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
      <div class="vh-github-header">
        <img class="vh-github-avatar" src="${repo.owner.avatar_url}" alt="${repo.owner.login}" loading="lazy" />
        <span class="vh-github-repo-name">${repo.full_name}</span>
      </div>
      <p class="vh-github-desc">${repo.description || '暂无描述'}</p>
      <div class="vh-github-meta">
        ${repo.language ? `<span class="vh-github-lang"><span class="vh-github-lang-dot" style="background-color:${getLangColor(repo.language)}"></span>${repo.language}</span>` : ''}
        <span class="vh-github-stars">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
          ${formatCount(repo.stargazers_count)}
        </span>
        <span class="vh-github-forks">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm-3 8.75a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"/></svg>
          ${formatCount(repo.forks_count)}
        </span>
        ${licenseText ? `<span class="vh-github-license">${licenseText}</span>` : ''}
        <span class="vh-github-updated">${updatedAgo}更新</span>
      </div>
    </a>
  `;
}

function buildErrorCard(element: HTMLElement, repo: string): void {
  element.classList.add('vh-github-error');
  element.innerHTML = `
    <a class="vh-github-card vh-github-card-error" href="https://github.com/${repo}" target="_blank" rel="noopener noreferrer">
      <div class="vh-github-header">
        <svg class="vh-github-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        <span class="vh-github-repo-name">${repo}</span>
      </div>
      <p class="vh-github-desc">无法获取仓库信息，点击访问 GitHub 查看</p>
    </a>
  `;
}

export default async () => {
  const elements = document.querySelectorAll<HTMLElement>('.vh-node.vh-github:not(.vh-github-loaded):not(.vh-github-error)');
  if (!elements.length) return;

  elements.forEach(async (el) => {
    const repo = el.getAttribute('data-repo');
    if (!repo) return;

    const data = await fetchRepo(repo);
    if (data) {
      buildCard(data, el);
    } else {
      buildErrorCard(el, repo);
    }
  });
};
