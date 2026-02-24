import nodemailer from 'nodemailer';

/**
 * 邮件发送器
 * 负责发送HTML格式的日报邮件
 */
export class MailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    this.from = process.env.SMTP_USER || 'yangchao228@gmail.com';
  }

  /**
   * 生成HTML日报 - 按来源分组，来源间按该来源最新文章时间倒序
   */
  generateHTMLDigest(groupedBySource, date) {
    const dateStr = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    // 计算总文章数
    const totalArticles = Object.values(groupedBySource).reduce((sum, articles) => sum + articles.length, 0);

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>认知主权日报 - ${dateStr}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header .date {
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .source-section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .source-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .source-header {
      background: #f8f9fa;
      padding: 12px 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .source-name {
      font-size: 16px;
      font-weight: bold;
      color: #667eea;
    }
    .source-count {
      background: #667eea;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
    .article {
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .article:last-child {
      border-bottom: none;
    }
    .article-title {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .article-title a {
      color: #333;
      text-decoration: none;
    }
    .article-title a:hover {
      color: #667eea;
    }
    .article-meta {
      font-size: 12px;
      color: #888;
    }
    .no-update {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    .no-update-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 30px;
      padding: 20px;
    }
    .total-count {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 13px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📰 认知主权日报</h1>
    <div class="date">${dateStr}</div>
  </div>
  
  <div class="content">`;

    if (totalArticles === 0) {
      // 无更新
      html += `
    <div class="no-update">
      <div class="no-update-icon">📭</div>
      <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">今日无更新</div>
      <div>近24小时内暂无新内容</div>
    </div>`;
    } else {
      // 显示总文章数
      html += `
    <div style="padding: 10px 0 20px 0; border-bottom: 1px solid #eee; margin-bottom: 15px;">
      <span class="total-count">今日共 ${totalArticles} 篇更新</span>
    </div>`;

      // 按来源分组显示，来源间已按最新文章时间倒序
      for (const [sourceName, articles] of Object.entries(groupedBySource)) {
        if (articles.length === 0) continue;
        
        const latestTime = new Date(articles[0].pubDate).toLocaleString('zh-CN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        html += `
    <div class="source-section">
      <div class="source-header">
        <span class="source-name">📡 ${sourceName}</span>
        <div>
          <span style="color: #888; font-size: 12px; margin-right: 10px;">最新: ${latestTime}</span>
          <span class="source-count">${articles.length} 篇</span>
        </div>
      </div>`;

        // 该来源下的文章按时间倒序
        for (const article of articles) {
          const pubDate = new Date(article.pubDate).toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          html += `
      <div class="article">
        <div class="article-title">
          <a href="${article.link}" target="_blank">${article.title}</a>
        </div>
        <div class="article-meta">📅 ${pubDate}</div>
      </div>`;
        }
        
        html += `
    </div>`;
      }
    }

    html += `
  </div>
  
  <div class="footer">
    <p>认知主权日报 - 自动 RSS 聚合</p>
    <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * 发送日报邮件
   */
  async sendDigest(groupedBySource, date) {
    const dateStr = date.toISOString().split('T')[0];
    const subject = `认知主权日报-${dateStr}`;
    const html = this.generateHTMLDigest(groupedBySource, date);

    const mailOptions = {
      from: `"认知主权日报" <${this.from}>`,
      to: 'yangchao228@gmail.com',
      subject: subject,
      html: html
    };

    try {
      console.log('📧 正在发送邮件...');
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ 邮件发送成功:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ 邮件发送失败:', error.message);
      throw error;
    }
  }
}
