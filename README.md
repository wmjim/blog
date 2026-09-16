### 部署

唯一生效的部署是 `.github/workflows/deploy.yml`：推送 `main` 后由 Actions 构建并发布到 GitHub Pages。

仓库内不应出现其他部署配置。本站是纯静态输出，不使用 Cloudflare（无 `wrangler.jsonc`）；评论服务 Waline 是独立项目 `blog-comments-bgst`，不要在本目录执行 `vercel` 链接。

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