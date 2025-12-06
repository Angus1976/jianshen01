FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache curl
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn run build:shared
RUN yarn run build:h5
RUN yarn run build:admin
RUN yarn run build:server
RUN mkdir -p public/h5 public/admin
RUN cp -r packages/member-h5/dist/* public/h5/ 2>/dev/null || true
RUN cp -r packages/admin/dist/* public/admin/ 2>/dev/null || true
RUN yarn install --production --frozen-lockfile --ignore-scripts
FROM node:18-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache curl tini
ENV NODE_ENV=production
ENV PORT=8000
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared ./packages/shared
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:8000/api/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/server/dist/app.js"]
EXPOSE 8000
