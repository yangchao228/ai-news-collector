import { RSSFetcher } from './fetcher.js';
import { Classifier } from './classifier.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * 主程序入口
 */
async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║     AI信息搜集系统 - MVP v1.0        ║');
  console.log('╚══════════════════════════════════════╝\n');

  // 初始化组件
  const fetcher = new RSSFetcher();
  const classifier = new Classifier();

  try {
    // 1. 抓取RSS
    const articles = await fetcher.fetchAll();
    
    if (articles.length === 0) {
      console.log('⚠️ 没有获取到任何文章');
      return;
    }

    // 2. 处理和分类
    console.log('\n🤖 正在分析文章内容...');
    const processed = classifier.processArticles(articles);
    const grouped = classifier.groupByCategory(processed);

    // 3. 保存结果
    const outputDir = './output';
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const outputFile = path.join(outputDir, `digest-${timestamp}.json`);
    
    await fs.writeFile(
      outputFile,
      JSON.stringify({ 
        generatedAt: new Date(),
        totalArticles: processed.length,
        categories: Object.keys(grouped),
        articles: processed,
        grouped
      }, null, 2)
    );
    
    console.log(`\n💾 结果已保存: ${outputFile}`);
    
    // 4. 生成摘要报告
    printSummary(grouped);

  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

/**
 * 打印摘要到控制台
 */
function printSummary(grouped) {
  console.log('\n' + '═'.repeat(50));
  console.log('📰 今日AI资讯摘要');
  console.log('═'.repeat(50));
  
  for (const [category, articles] of Object.entries(grouped)) {
    console.log(`\n【${category}】${articles.length}篇`);
    console.log('-'.repeat(40));
    
    articles.slice(0, 3).forEach((article, i) => {
      const stars = '⭐'.repeat(Math.floor(article.importance / 2));
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   📎 ${article.link}`);
      console.log(`   📅 ${article.pubDate.toLocaleDateString()} ${stars}`);
      console.log();
    });
    
    if (articles.length > 3) {
      console.log(`   ... 还有 ${articles.length - 3} 篇`);
    }
  }
  
  console.log('═'.repeat(50));
}

main();