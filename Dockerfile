# RocketBird 容器化部署 - 多阶段构建
# 前端 + 后端 + H5 都在一个容器内

# ============================================
# 第一阶段: 构建 H5 前端
# ============================================
FROM node:18-alpine as h5-builder

WORKDIR /app

# 复制 H5 和共享库代码
COPY packages/member-h5/ ./member-h5/
COPY packages/shared/ ./shared/
COPY package.json yarn.lock ./

# 安装依赖并构建 H5
RUN yarn install --frozen-lockfile && \
    yarn workspace @rocketbird/member-h5 build

# ============================================
# 第二阶段: 构建管理后台
# ============================================
FROM node:18-alpine as admin-builder

WORKDIR /app

# 复制代码
COPY packages/admin/ ./admin/
COPY packages/shared/ ./shared/
COPY package.json yarn.lock ./

# 安装依赖并构建管理后台
RUN yarn install --frozen-lockfile && \
    yarn workspace @rocketbird/admin build

# ============================================
# 第三阶段: 构建后端服务
# ============================================
FROM node:18-alpine as server-builder

WORKDIR /app

# 复制代码
COPY packages/server/ ./server/
COPY packages/shared/ ./shared/
COPY package.json yarn.lock ./

# 安装依赖并构建后端
RUN yarn install --frozen-lockfile && \
    yarn workspace @rocketbird/server build

# ============================================
# 最终阶段: 生产镜像
# ============================================
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
RUN apk add --no-cache \
    curl \
    tini

# 从 builder 阶段复制编译后的代码
COPY --from=h5-builder /app/member-h5/dist ./public/h5
COPY --from=admin-builder /app/admin/dist ./public/admin
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules ./node_modules

# 复制服务器入口文件
COPY --from=server-builder /app/server/dist/app.js ./app.js

# 设置环境变量
ENV NODE_ENV=production \
    PORT=8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# 使用 tini 作为 PID 1 进程
ENTRYPOINT ["/sbin/tini", "--"]

# 启动应用
CMD ["node", "app.js"]

# 暴露端口
EXPOSE 8000
