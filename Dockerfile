FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl tini

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn run build:h5

RUN yarn run build:admin

RUN yarn run build:server

RUN mkdir -p public/h5 public/admin && \
    cp -r packages/member-h5/dist/* public/h5/ 2>/dev/null || true && \
    cp -r packages/admin/dist/* public/admin/ 2>/dev/null || true

ENV NODE_ENV=production PORT=8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/server/dist/app.js"]

EXPOSE 8000
