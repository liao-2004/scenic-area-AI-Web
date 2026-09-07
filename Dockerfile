FROM node:18-alpine

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存
COPY package*.json ./
RUN npm install --production

# 复制项目源码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动
CMD ["node", "app.js"]