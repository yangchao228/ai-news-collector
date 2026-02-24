# AI信息搜集系统 MVP

基于 Daniel Miessler 的 Personal AI Infrastructure 理念构建

## 系统架构

### 核心组件

1. **信息源层 (Source Layer)**
   - RSS Feed 抓取器
   - 初始数据源: https://danielmiessler.com/feed.rss
   - 可扩展: 添加更多AI相关RSS源

2. **处理层 (Processing Layer)**
   - 内容解析与清洗
   - AI应用方向标签分类
   - 重要性评分

3. **存储层 (Storage Layer)**
   - 飞书文档作为知识库
   - 结构化存储文章元数据
   - 支持全文检索

4. **展示层 (Presentation Layer)**
   - 每日/每周摘要
   - 主题分类浏览
   - 重点文章推荐

## 数据流

```
RSS源 → 抓取 → 解析 → 分类 → 存储 → 展示
                ↓
            AI分析摘要
```

## 核心文件结构

```
ai-news-collector/
├── config/
│   └── sources.json          # 信息源配置
├── src/
│   ├── fetcher.js            # RSS抓取器
│   ├── parser.js             # 内容解析器
│   ├── classifier.js         # AI分类器
│   └── reporter.js           # 报告生成器
├── storage/
│   └── articles/             # 文章存储
└── output/
    └── daily-digest.md       # 每日摘要
```

## 关键功能

### 1. RSS抓取 (fetcher)
- 定时抓取多个RSS源
- 去重处理
- 增量更新

### 2. 内容解析 (parser)
- 提取标题、摘要、链接、发布时间
- 清洗HTML标签
- 提取关键内容片段

### 3. AI分类 (classifier)
- 识别AI应用方向类别:
  - AI基础设施
  - 机器学习研究
  - AI安全/对齐
  - AI产品应用
  - 开发工具
  - 行业动态
- 生成中文摘要

### 4. 报告生成 (reporter)
- 按类别组织文章
- 生成飞书文档格式
- 添加阅读建议

## 技术栈

- **运行时**: Node.js / Bun
- **RSS解析**: feed-parser
- **HTTP请求**: fetch API
- **文档输出**: 飞书 API

## 使用方式

```bash
# 安装依赖
npm install

# 配置信息源
npm run config

# 手动运行一次
npm run collect

# 查看结果
npm run report
```

## 扩展计划

1. **自动化**: 设置定时任务 (cron)
2. **多源支持**: 添加更多AI相关RSS源
3. **智能筛选**: 基于用户兴趣的个性化推荐
4. **互动功能**: 用户反馈、收藏、分享
5. **多语言**: 自动翻译非中文内容

## PAI 理念应用

参考 PAI 的核心原则:

1. **Skill System**: 将信息搜集封装为可复用的Skill
2. **Memory System**: 记录用户的阅读偏好和反馈
3. **Algorithm**: 应用 Observe → Think → Plan → Execute → Verify → Learn 循环
4. **User Centricity**: 以用户需求为中心，而非技术展示
