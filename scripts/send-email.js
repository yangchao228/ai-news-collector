#!/usr/bin/env node
/**
 * 日报邮件发送脚本
 * 需要配置SMTP服务器信息
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 邮件配置（需要用户填写）
const EMAIL_CONFIG = {
  // SMTP服务器配置 - 需要用户提供
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',  // Gmail示例
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',  // 发件人邮箱
    pass: process.env.SMTP_PASS || '',  // 邮箱密码/应用专用密码
  },
  // 收件人
  to: 'yangchao228@gmail.com',
  // 发件人显示名称
  fromName: 'AI日报机器人'
};

async function main() {
  try {
    console.log('📧 准备发送日报邮件...');
    
    // 检查SMTP配置
    if (!EMAIL_CONFIG.smtp.user || !EMAIL_CONFIG.smtp.pass) {
      console.log('⚠️ 注意: SMTP未配置，使用备用方案');
      console.log('请设置环境变量: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      await sendViaFeishu();
      return;
    }
    
    // 读取最新报告
    const outputDir = '/root/.openclaw/workspace/ai-news-collector/output';
    const resultPath = path.join(outputDir, 'latest-result.json');
    
    let reportContent;
    let subject;
    
    try {
      const resultData = await fs.readFile(resultPath, 'utf-8');
      const result = JSON.parse(resultData);
      reportContent = result.fullContent;
      subject = `🤖 AI日报 - ${result.summary.date} (${result.summary.totalArticles}篇文章)`;
    } catch (e) {
      // 如果没有结果文件，读取最新的md文件
      const files = await fs.readdir(outputDir);
      const latestMd = files
        .filter(f => f.startsWith('digest-') && f.endsWith('.md'))
        .sort()
        .pop();
      
      if (!latestMd) {
        throw new Error('未找到报告文件');
      }
      
      reportContent = await fs.readFile(path.join(outputDir, latestMd), 'utf-8');
      subject = '🤖 AI日报 - ' + new Date().toLocaleDateString('zh-CN');
    }
    
    // 使用nodemailer发送邮件（如果已安装）
    // 或者使用 sendmail 命令
    await sendEmail(subject, reportContent);
    
    console.log('✅ 邮件发送成功！');
    console.log('📧 收件人:', EMAIL_CONFIG.to);
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
    console.log('🔄 切换到飞书发送...');
    await sendViaFeishu();
  }
}

async function sendEmail(subject, content) {
  // 尝试使用 sendmail 命令
  try {
    const { stdout } = await execAsync('which sendmail');
    if (stdout.trim()) {
      // 使用sendmail
      const email = `To: ${EMAIL_CONFIG.to}
Subject: ${subject}
Content-Type: text/plain; charset=utf-8

${content}`;
      
      await execAsync(`echo '${email}' | sendmail ${EMAIL_CONFIG.to}`);
      return;
    }
  } catch (e) {
    // sendmail 不可用
  }
  
  // 尝试使用 msmtp
  try {
    const { stdout } = await execAsync('which msmtp');
    if (stdout.trim()) {
      const email = `To: ${EMAIL_CONFIG.to}
Subject: ${subject}
Content-Type: text/plain; charset=utf-8

${content}`;
      
      await execAsync(`echo '${email}' | msmtp ${EMAIL_CONFIG.to}`);
      return;
    }
  } catch (e) {
    // msmtp 不可用
  }
  
  // 尝试使用 Python 的 smtplib
  const pythonScript = `
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

msg = MIMEMultipart()
msg['From'] = '${EMAIL_CONFIG.smtp.user}'
msg['To'] = '${EMAIL_CONFIG.to}'
msg['Subject'] = '''${subject}'''

body = '''${content.replace(/'/g, "'\"'\"'").substring(0, 5000)}...'''
msg.attach(MIMEText(body, 'plain', 'utf-8'))

try:
    server = smtplib.SMTP('${EMAIL_CONFIG.smtp.host}', ${EMAIL_CONFIG.smtp.port})
    server.starttls()
    server.login('${EMAIL_CONFIG.smtp.user}', '${EMAIL_CONFIG.smtp.pass}')
    server.send_message(msg)
    server.quit()
    print('Email sent successfully')
except Exception as e:
    print(f'Failed to send email: {e}')
    exit(1)
`;
  
  await fs.writeFile('/tmp/send_email.py', pythonScript);
  await execAsync('python3 /tmp/send_email.py');
}

async function sendViaFeishu() {
  console.log('📤 通过飞书发送日报通知...');
  const outputDir = '/root/.openclaw/workspace/ai-news-collector/output';
  const resultPath = path.join(outputDir, 'latest-result.json');
  
  const resultData = await fs.readFile(resultPath, 'utf-8');
  const result = JSON.parse(resultData);
  
  const summary = result.summary;
  
  // 输出飞书消息格式（供调用方使用）
  const message = `## 🤖 AI日报 - ${summary.date}

> 📊 共收集 **${summary.totalArticles}** 篇文章  
> 🔄 数据源: Daniel Miessler RSS

### 🔥 今日精选 Top 5

${summary.top5Titles.map((title, i) => `${i + 1}. ${title}`).join('\n')}

### 📑 分类概览

${summary.categories.map(cat => `• ${cat}`).join('\n')}

---

⚠️ 邮件发送功能需要SMTP配置  
📎 完整报告路径: \`/root/.openclaw/workspace/ai-news-collector/output/digest-${summary.date.replace(/\//g, '-')}.md\`

*发送时间: ${new Date().toLocaleString('zh-CN')}*
`;

  console.log('FEISHU_MESSAGE_START');
  console.log(message);
  console.log('FEISHU_MESSAGE_END');
}

main();