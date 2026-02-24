import { categories, keywords } from './config.js';

/**
 * 内容分类器
 * 自动识别AI应用方向并生成摘要
 */
export class Classifier {
  /**
   * 基于关键词自动分类
   */
  classify(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const scores = {};
    
    for (const [category, words] of Object.entries(keywords)) {
      scores[category] = words.reduce((score, word) => {
        const regex = new RegExp(word.toLowerCase(), 'g');
        const matches = text.match(regex);
        return score + (matches ? matches.length : 0);
      }, 0);
    }
    
    // 找到得分最高的类别
    const bestCategory = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return bestCategory && bestCategory[1] > 0 
      ? bestCategory[0] 
      : '其他';
  }

  /**
   * 生成文章摘要
   */
  generateSummary(article) {
    const content = article.description || '';
    // 提取前200个字符作为摘要
    return content.length > 200 
      ? content.substring(0, 200) + '...'
      : content;
  }

  /**
   * 计算文章重要性评分 (1-10)
   */
  calculateImportance(article) {
    let score = 5; // 基础分
    
    // 根据来源优先级加分
    if (article.priority === 'high') score += 2;
    
    // 根据发布时间加分（越新越重要）
    const daysSince = (new Date() - article.pubDate) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) score += 2;
    else if (daysSince < 3) score += 1;
    
    // 根据标题关键词加分
    const importantKeywords = ['breakthrough', 'release', 'launch', 'major', 'new', 'AI'];
    const title = article.title.toLowerCase();
    importantKeywords.forEach(kw => {
      if (title.includes(kw.toLowerCase())) score += 0.5;
    });
    
    return Math.min(Math.round(score), 10);
  }

  /**
   * 处理文章列表
   */
  processArticles(articles) {
    return articles.map(article => ({
      ...article,
      category: this.classify(article),
      summary: this.generateSummary(article),
      importance: this.calculateImportance(article),
      processedAt: new Date()
    }));
  }

  /**
   * 按类别分组
   */
  groupByCategory(processedArticles) {
    const groups = {};
    
    processedArticles.forEach(article => {
      const cat = article.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(article);
    });
    
    return groups;
  }
}