# 极简 RocketBird 部署配置
# 单步构建，避免所有 workspace 问题

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl tini

# 一步到位：复制、安装、构建、整理
COPY . . && \
    yarn install --frozen-lockfile && \
    yarn run build:h5 && yarn run build:admin && yarn run build:server && \
    mkdir -p public/h5 public/admin && \
    cp -r packages/member-h5/dist/* public/h5/ 2>/dev/null || true && \
    cp -r packages/admin/dist/* public/admin/ 2>/dev/null || true

ENV NODE_ENV=production PORT=8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/server/dist/app.js"]

EXPOSE 8000
