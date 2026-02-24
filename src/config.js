// RSS信息源配置
export const sources = [
  {
    name: "机器之心",
    url: "https://www.jiqizhixin.com/rss",
    category: "AI资讯",
    priority: "high"
  },
  {
    name: "量子位",
    url: "https://www.qbitai.com/feed",
    category: "AI资讯",
    priority: "high"
  },
  {
    name: "Daniel Miessler",
    url: "https://danielmiessler.com/feed.rss",
    category: "AI基础设施/安全",
    priority: "high"
  }
  // 可扩展更多源:
  // { name: "OpenAI Blog", url: "https://openai.com/blog/rss.xml", category: "研究", priority: "high" },
  // { name: "Anthropic", url: "https://www.anthropic.com/rss.xml", category: "研究", priority: "high" },
];

// AI应用方向分类标签
export const categories = [
  "AI基础设施",
  "机器学习研究", 
  "AI安全与对齐",
  "AI产品应用",
  "开发工具",
  "行业动态",
  "创业/商业",
  "技术教程"
];

// 关键词映射，用于自动分类
export const keywords = {
  "AI基础设施": ["infrastructure", "platform", "system", "framework", "PAI", "agent"],
  "机器学习研究": ["research", "model", "training", "RL", "reinforcement", "paper"],
  "AI安全与对齐": ["safety", "alignment", "security", "risk", "ethics"],
  "AI产品应用": ["product", "application", "tool", "feature", "launch"],
  "开发工具": ["coding", "development", "API", "CLI", "SDK"],
  "行业动态": ["news", "announcement", "update", "release"],
  "创业/商业": ["startup", "business", "market", "investment"],
  "技术教程": ["tutorial", "guide", "how-to", "learn"]
};