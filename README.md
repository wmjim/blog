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