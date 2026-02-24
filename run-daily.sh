#!/bin/bash

# 认知主权日报 - 每日定时运行脚本
# 加载环境变量并执行日报任务

# 设置工作目录
WORKSPACE="/root/.openclaw/workspace/ai-news-collector"
cd "$WORKSPACE"

# 从 OpenClaw 配置中加载环境变量
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="yangchao228@gmail.com"
export SMTP_PASS="wosu ievq rafh imfy"

# 记录日志
LOG_FILE="/tmp/daily-digest.log"
echo "========== 日报任务开始 $(date '+%Y-%m-%d %H:%M:%S') ==========" >> "$LOG_FILE"

# 运行日报脚本
node src/daily-digest.js 2>&1 | tee -a "$LOG_FILE"

# 记录完成
echo "========== 日报任务结束 $(date '+%Y-%m-%d %H:%M:%S') ==========" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
