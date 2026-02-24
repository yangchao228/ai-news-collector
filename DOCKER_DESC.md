# 查看容器
docker ps
# ai-news-collector   Up 47 seconds

# 手动运行日报
docker-compose exec ai-news-collector node src/daily-digest.js

# 查看日志
docker-compose logs -f

# 停止/启动
docker-compose down
docker-compose up -d



## 数据持久化
`output/` 目录已挂载到容器外
日报备份: `digest-2026-02-24.json` (127KB)
## 迁移到其他服务器
# 打包整个项目
tar -czvf ai-news-collector.tar.gz ai-news-collector/

# 传输并部署
scp ai-news-collector.tar.gz user@new-server:/opt/
ssh user@new-server "cd /opt && tar -xzvf ai-news-collector.tar.gz && cd ai-news-collector && docker-compose up -d --build"
