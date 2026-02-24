import { RSSFetcher } from './fetcher.js';
import { MailSender } from './mailer.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * 认知主权日报 - 每日自动发送脚本
 * 抓取RSS -> 筛选近24小时内容 -> 按来源分组 -> 按来源最新时间倒序 -> 生成HTML日报 -> 发送邮件
 */
async function main() {
  const now = new Date();
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       📰 认知主权日报 - 自动生成系统             ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  console.log(`🕐 运行时间: ${now.toLocaleString('zh-CN')}\n`);

  // 初始化组件
  const fetcher = new RSSFetcher();
  const mailer = new MailSender();

  try {
    // 1. 抓取RSS
    console.log('📡 正在抓取RSS源...');
    const allArticles = await fetcher.fetchAll();
    
    // 2. 筛选近24小时的文章
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentArticles = allArticles.filter(article => {
      const pubDate = new Date(article.pubDate);
      return pubDate >= oneDayAgo;
    });

    console.log(`\n📊 近24小时更新: ${recentArticles.length} 篇`);

    // 3. 按来源分组
    const groupedBySource = {};
    for (const article of recentArticles) {
      const source = article.source;
      if (!groupedBySource[source]) {
        groupedBySource[source] = [];
      }
      groupedBySource[source].push(article);
    }

    // 4. 每个来源内部按时间倒序，并计算该来源的最新时间
    const sourceEntries = [];
    for (const [sourceName, articles] of Object.entries(groupedBySource)) {
      // 按时间倒序排序
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      // 记录来源和最新时间
      sourceEntries.push({
        name: sourceName,
        articles: articles,
        latestTime: new Date(articles[0].pubDate)
      });
    }

    // 5. 来源间按最新文章时间倒序排序
    sourceEntries.sort((a, b) => b.latestTime - a.latestTime);

    // 6. 重建分组对象（按排序后的顺序）
    const sortedGroupedBySource = {};
    for (const entry of sourceEntries) {
      sortedGroupedBySource[entry.name] = entry.articles;
    }

    // 7. 打印摘要
    if (recentArticles.length > 0) {
      printSummary(sortedGroupedBySource);
    } else {
      console.log('\n📭 今日无更新');
    }

    // 8. 发送邮件
    console.log('\n📧 正在生成并发送日报邮件...');
    await mailer.sendDigest(sortedGroupedBySource, now);

    // 9. 保存本地备份
    const outputDir = './output';
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = now.toISOString().split('T')[0];
    const outputFile = path.join(outputDir, `digest-${timestamp}.json`);
    
    await fs.writeFile(
      outputFile,
      JSON.stringify({ 
        generatedAt: now,
        recentArticlesCount: recentArticles.length,
        totalArticles: allArticles.length,
        groupedBySource: sortedGroupedBySource
      }, null, 2)
    );
    
    console.log(`\n💾 本地备份已保存: ${outputFile}`);

    console.log('\n✨ 日报任务完成！');

  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  }
}

/**
 * 打印摘要到控制台
 */
function printSummary(groupedBySource) {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 今日更新摘要（按来源最新时间倒序）');
  console.log('═'.repeat(60));
  
  for (const [sourceName, articles] of Object.entries(groupedBySource)) {
    const latestTime = new Date(articles[0].pubDate).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(`\n📡 ${sourceName} (${articles.length}篇) - 最新: ${latestTime}`);
    console.log('-'.repeat(50));
    
    articles.forEach((article, i) => {
      const pubDate = new Date(article.pubDate).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`  ${i + 1}. ${article.title}`);
      console.log(`      📅 ${pubDate}`);
    });
  }
  
  console.log('\n' + '═'.repeat(60));
}

main();
