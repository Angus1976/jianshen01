# RocketBird 容器化部署 - 单阶段简化构建

FROM node:18-alpine

WORKDIR /app

# 安装工具
RUN apk add --no-cache curl tini

# 复制源代码
COPY . .

# 构建所有模块（使用根目录 yarn 配置）
RUN yarn install --frozen-lockfile && \
    yarn run build:h5 && \
    yarn run build:admin && \
    yarn run build:server && \
    mkdir -p public/h5 public/admin && \
    cp -r packages/member-h5/dist/* public/h5/ 2>/dev/null || true && \
    cp -r packages/admin/dist/* public/admin/ 2>/dev/null || true

# 设置环境变量
ENV NODE_ENV=production PORT=8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# 进程管理
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/server/dist/app.js"]

# 暴露端口
EXPOSE 8000
