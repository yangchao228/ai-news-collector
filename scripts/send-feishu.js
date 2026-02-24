#!/usr/bin/env node
/**
 * 日报发送脚本 - 飞书版本
 * 读取最新日报并通过飞书发送
 */

import fs from 'fs/promises';
import path from 'path';

const FEISHU_USER_ID = 'ou_a8386459181e73240c4dbad488ea76a0';

async function main() {
  try {
    const outputDir = '/root/.openclaw/workspace/ai-news-collector/output';
    
    // 读取最新的结果文件
    const resultPath = path.join(outputDir, 'latest-result.json');
    const resultData = await fs.readFile(resultPath, 'utf-8');
    const result = JSON.parse(resultData);
    
    if (!result.success) {
      throw new Error('日报生成失败');
    }
    
    // 构建飞书消息
    const summary = result.summary;
    const message = `## 🤖 AI日报 - ${summary.date}

> 📊 共收集 ${summary.totalArticles} 篇文章  
> 🔄 数据源: Daniel Miessler RSS

### 🔥 今日精选 Top 5

${summary.top5Titles.map((title, i) => `${i + 1}. ${title}`).join('\n')}

### 📑 分类概览

${summary.categories.map(cat => `• ${cat}`).join('\n')}

---

📎 **完整报告**请查看附件或访问工作目录

*发送时间: ${new Date().toLocaleString('zh-CN')}*
`;

    // 输出消息内容（供message工具使用）
    console.log('MESSAGE_CONTENT_START');
    console.log(message);
    console.log('MESSAGE_CONTENT_END');
    
    // 同时保存到文件
    const notificationPath = path.join(outputDir, 'latest-notification.md');
    await fs.writeFile(notificationPath, message);
    
    console.log('✅ 飞书消息已生成');
    console.log('报告文件:', result.reportFile);
    
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    process.exit(1);
  }
}

main();