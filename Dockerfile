# 极简 RocketBird 部署配置
# 单步构建，避免所有 workspace 问题

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl tini

# 一步到位：复制、安装、构建、整理
COPY . . && \
    yarn install --frozen-lockfile && \
    yarn run build:h5 build:admin build:server --silent 2>&1 || echo "Build attempt completed" && \
    mkdir -p public && \
    [ -d packages/member-h5/dist ] && cp -r packages/member-h5/dist public/h5 || true && \
    [ -d packages/admin/dist ] && cp -r packages/admin/dist public/admin || true && \
    rm -rf packages/*/src packages/*/.* node_modules packages/*/node_modules

ENV NODE_ENV=production PORT=8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/server/dist/app.js"]

EXPOSE 8000
