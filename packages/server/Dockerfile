FROM node:18-alpine

WORKDIR /app

# 复制 package.json
COPY package.json yarn.lock* ./

# 安装依赖
RUN yarn install --production --frozen-lockfile

# 复制构建产物
COPY dist/ ./dist/

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "dist/app.js"]
