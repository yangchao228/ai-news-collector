#!/usr/bin/env node
/**
 * AI日报自动收集和发送脚本
 * 用于定时任务执行
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function main() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 开始执行AI日报收集任务...`);
  
  try {
    // 1. 运行收集程序
    console.log('📡 正在抓取RSS数据...');
    await execAsync('node src/index.js', { 
      cwd: '/root/.openclaw/workspace/ai-news-collector' 
    });
    
    // 2. 生成报告
    console.log('📝 正在生成日报...');
    await execAsync('node src/reporter.js', { 
      cwd: '/root/.openclaw/workspace/ai-news-collector' 
    });
    
    // 3. 读取生成的报告
    const outputDir = '/root/.openclaw/workspace/ai-news-collector/output';
    const files = await fs.readdir(outputDir);
    const latestMd = files
      .filter(f => f.startsWith('digest-') && f.endsWith('.md'))
      .sort()
      .pop();
    
    if (!latestMd) {
      throw new Error('未找到生成的报告文件');
    }
    
    const reportPath = path.join(outputDir, latestMd);
    const reportContent = await fs.readFile(reportPath, 'utf-8');
    
    console.log('✅ 日报生成完成:', latestMd);
    
    // 4. 提取关键信息用于邮件摘要
    const summary = extractSummary(reportContent);
    
    // 输出结果（供调用方捕获）
    const result = {
      success: true,
      reportFile: latestMd,
      summary: summary,
      fullContent: reportContent,
      generatedAt: new Date().toISOString()
    };
    
    console.log('\n📊 日报摘要:');
    console.log(JSON.stringify(summary, null, 2));
    
    // 将结果写入文件供其他程序使用
    await fs.writeFile(
      path.join(outputDir, 'latest-result.json'),
      JSON.stringify(result, null, 2)
    );
    
    console.log('\n✅ 任务完成！');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 任务失败:', error.message);
    process.exit(1);
  }
}

function extractSummary(content) {
  // 提取文章总数
  const totalMatch = content.match(/总计:\s*(\d+)\s*篇文章/);
  const totalArticles = totalMatch ? parseInt(totalMatch[1]) : 0;
  
  // 提取日期
  const dateMatch = content.match(/生成时间:\s*(\d{4}\/\d{1,2}\/\d{1,2})/);
  const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('zh-CN');
  
  // 提取Top 5标题
  const top5Titles = [];
  const top5Matches = content.matchAll(/### \d+\.\s*(.+?)(?:\n|$)/g);
  for (const match of top5Matches) {
    if (top5Titles.length < 5) {
      top5Titles.push(match[1].trim());
    }
  }
  
  return {
    date,
    totalArticles,
    top5Titles,
    categories: [
      'AI基础设施',
      '机器学习研究',
      'AI安全与对齐',
      'AI产品应用',
      '开发工具',
      '技术教程',
      '创业/商业',
      '行业动态'
    ]
  };
}

main();