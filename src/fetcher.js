import { XMLParser } from 'fast-xml-parser';
import { sources } from './config.js';

/**
 * RSS Feed 抓取器
 * 负责从多个RSS源获取最新内容
 */
export class RSSFetcher {
  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
  }

  /**
   * 抓取单个RSS源
   */
  async fetchSource(source) {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'AI-News-Collector/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      const parsed = this.parser.parse(xmlData);
      
      return this.extractArticles(parsed, source);
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error.message);
      return [];
    }
  }

  /**
   * 从解析后的XML提取文章
   */
  extractArticles(parsed, source) {
    const channel = parsed?.rss?.channel;
    if (!channel || !channel.item) {
      return [];
    }

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    
    return items.map(item => ({
      title: this.cleanText(item.title),
      link: item.link,
      description: this.cleanText(item.description),
      pubDate: new Date(item.pubDate),
      author: item.author || channel.title,
      source: source.name,
      sourceCategory: source.category,
      priority: source.priority,
      content: item['content:encoded'] || item.description
    }));
  }

  /**
   * 清洗文本内容
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<\!\[CDATA\[/g, '')
      .replace(/\]\]>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 抓取所有配置的RSS源
   */
  async fetchAll() {
    console.log('🚀 开始抓取RSS源...');
    const allArticles = [];
    
    for (const source of sources) {
      console.log(`📡 正在抓取: ${source.name}`);
      const articles = await this.fetchSource(source);
      allArticles.push(...articles);
      console.log(`✅ 获取 ${articles.length} 篇文章`);
    }
    
    // 按发布时间排序
    allArticles.sort((a, b) => b.pubDate - a.pubDate);
    
    console.log(`\n📊 总计获取 ${allArticles.length} 篇文章`);
    return allArticles;
  }
}