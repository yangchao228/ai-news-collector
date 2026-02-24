#!/bin/bash
# AI日报自动收集和发送脚本 - 主入口
# 每天7点运行（北京时间）

cd /root/.openclaw/workspace/ai-news-collector

echo "[$(date)] 开始执行AI日报收集任务..."

# 1. 运行收集和生成报告
echo "📡 正在抓取RSS数据..."
node scripts/daily-collect.js

if [ $? -eq 0 ]; then
    echo "✅ 日报收集完成"
    
    # 2. 尝试发送邮件
    echo "📧 尝试发送邮件..."
    node scripts/send-email.js
    
    # 3. 输出最新报告路径
    LATEST_MD=$(ls -t output/digest-*.md | head -1)
    echo "📄 最新报告: $LATEST_MD"
    
    echo "[$(date)] 任务完成"
else
    echo "❌ 日报收集失败"
    exit 1
fi