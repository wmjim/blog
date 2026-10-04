### 部署

部署目标为 Cloudflare Workers 静态资源，配置见 `wrangler.jsonc`（`assets.directory: ./dist`），上线地址 `https://blog.meng-w1016.workers.dev`。

站点部署在域名根路径，`astro.config.mjs` 的 `base` 为 `/`。若改回子路径部署，需同步修改 `base` 与 `src/config.ts` 的 `Site`。

评论服务 Waline 是独立项目 `blog-comments-bgst`，不要在本目录执行 `vercel` 链接。`.github/workflows/deploy.yml` 为旧的 GitHub Pages 通道，已不再使用。

### 本地开发

```bash
# 重新构建
rm -rf node_modules/.astro && pnpm build
# 安装依赖
pnpm install
# 本地开发
pnpm dev
# 构建静态文件
pnpm build
# 创建新文章
pnpm newpost '文章标题'
```