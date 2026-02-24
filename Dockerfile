# AI News Collector Docker 镜像
# 基于 Node.js 22 轻量级镜像

FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 先复制 package.json 以利用 Docker 缓存
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY run-daily.sh ./

# 确保脚本可执行
RUN chmod +x run-daily.sh

# 创建输出目录
RUN mkdir -p output

# 设置时区为上海
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 默认环境变量（可在运行时覆盖）
ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PORT=587
ENV SMTP_USER=
ENV SMTP_PASS=

# 容器启动命令
CMD ["node", "src/daily-digest.js"]
