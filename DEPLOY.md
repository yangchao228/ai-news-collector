# AI News Collector - Docker 部署指南

## 快速开始

### 1. 环境准备

确保已安装：
- Docker Engine 20.10+
- Docker Compose 2.0+

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填写你的 SMTP 配置
vi .env
```

### 3. 构建并启动

```bash
# 构建镜像并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f ai-news-collector
```

### 4. 手动运行测试

```bash
# 立即执行一次日报生成
docker-compose exec ai-news-collector node src/daily-digest.js
```

## 部署方式

### 方式一：内置 Cron（推荐）

使用容器内部的 crond 定时任务：

```yaml
# docker-compose.yml 中
command: >
  sh -c "
    echo '0 7 * * * cd /app && node src/daily-digest.js >> /app/output/cron.log 2>&1' > /etc/crontabs/root &&
    crond -f
  "
```

每天早上 7:00 自动运行。

### 方式二：宿主机 Cron

在宿主机设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天早上7点运行）
0 7 * * * cd /path/to/ai-news-collector && docker-compose exec -T ai-news-collector node src/daily-digest.js >> ./output/cron.log 2>&1
```

### 方式三：OpenClaw Cron（当前使用）

通过 OpenClaw 的 cron 系统触发：

```bash
# 手动触发测试
docker-compose exec ai-news-collector node src/daily-digest.js
```

### 方式四：Ofelia 定时调度器

取消 docker-compose.yml 中 ofelia 服务的注释，使用外部定时调度。

## 数据持久化

| 路径 | 说明 |
|------|------|
| `./output` | 日报 JSON 备份和日志 |
| `./src/config.js` | RSS 源配置（只读挂载） |

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重新构建
docker-compose up -d --build

# 进入容器
docker-compose exec ai-news-collector sh

# 查看生成的日报文件
ls -la output/
```

## 迁移到其他服务器

```bash
# 1. 打包整个项目
tar -czvf ai-news-collector.tar.gz ai-news-collector/

# 2. 传输到目标服务器
scp ai-news-collector.tar.gz user@new-server:/path/

# 3. 在目标服务器解压并部署
ssh user@new-server
cd /path
tar -xzvf ai-news-collector.tar.gz
cd ai-news-collector
cp .env.example .env
# 编辑 .env 填入配置
vi .env
docker-compose up -d --build
```

## 环境变量说明

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `SMTP_HOST` | 是 | smtp.gmail.com | SMTP 服务器地址 |
| `SMTP_PORT` | 否 | 587 | SMTP 端口 |
| `SMTP_USER` | 是 | - | 发件邮箱 |
| `SMTP_PASS` | 是 | - | 邮箱密码/授权码 |
| `TZ` | 否 | Asia/Shanghai | 时区 |

## 目录结构

```
ai-news-collector/
├── Dockerfile              # Docker 镜像定义
├── docker-compose.yml      # Docker Compose 配置
├── .env.example            # 环境变量模板
├── DEPLOY.md               # 本部署文档
├── package.json            # Node.js 依赖
├── src/
│   ├── config.js           # RSS 源配置
│   ├── daily-digest.js     # 日报主脚本
│   ├── fetcher.js          # RSS 抓取器
│   ├── mailer.js           # 邮件发送器
│   └── ...
├── scripts/                # 辅助脚本
└── output/                 # 输出目录（自动创建）
```

## 故障排查

### 1. 邮件发送失败

检查 SMTP 配置：
```bash
docker-compose exec ai-news-collector node -e "
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
"
```

### 2. 定时任务不执行

查看 cron 日志：
```bash
docker-compose exec ai-news-collector cat /app/output/cron.log
```

### 3. RSS 抓取失败

测试单个源：
```bash
docker-compose exec ai-news-collector node -e "
  import('./src/fetcher.js').then(m => {
    const f = new m.RSSFetcher();
    f.fetchAll().then(console.log);
  });
"
```

## 更新部署

```bash
# 拉取最新代码后重新构建
git pull  # 或手动更新代码
docker-compose down
docker-compose up -d --build
```
