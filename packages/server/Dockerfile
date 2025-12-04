FROM node:18-alpine

WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock* ./

# 安装所有依赖（包括 devDependencies 用于构建）
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["yarn", "start"]
