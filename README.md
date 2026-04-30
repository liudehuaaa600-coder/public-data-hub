# 🌍 公开数据查询中心

> **实时热榜聚合 · 政府公开数据 · 专利检索 · 学术论文**
> 
> 基于 OpenCLI 自动抓取，GitHub Pages 部署，完全免费运行。

## 🔗 访问地址

**https://liudehuaaa600-coder.github.io/public-data-hub/**

## ✨ 功能特性

### 🔥 实时热榜聚合
- **Hacker News** 热门技术文章
- **东方财富** 财经快讯 + 热股榜
- **Stack Overflow** 热门问答
- **维基百科** 热门阅读

### 🏛️ 政府公开数据
- **国务院** 最新政策文件
- **国家法律法规数据库** 最新法规
- 全球 20+ 国家政府数据门户入口

### 📋 专利检索
- Google Patents、USPTO、WIPO、Espacenet
- 中国国家知识产权局
- 一键跳转多平台搜索

### 📚 学术论文
- arXiv 最新 ML/LLM 论文推送
- Google Scholar、Semantic Scholar、PubMed 入口
- 中国知网 CNKI 快速检索

### 🌤️ 北京实时状态
- Open-Meteo API 实时天气
- 北京时间秒级更新

## ⚙️ 技术架构

```
GitHub Actions (每2小时)
    └── OpenCLI 抓取数据
        └── JSON 存储到 data/
            └── 前端动态加载展示
```

**数据来源：**
- 抓取引擎：[OpenCLI](https://github.com/jackwener/opencli)
- 天气 API：[Open-Meteo](https://open-meteo.com/)
- 政策法规：中国政府网公开数据

## 🚀 自动更新机制

项目通过 GitHub Actions 自动抓取数据：

| 数据源 | 更新频率 | 命令 |
|--------|----------|------|
| HackerNews Top | 每2小时 | `opencli hackernews top` |
| 东方财富快讯 | 每2小时 | `opencli eastmoney kuaixun` |
| 东方财富热股 | 每2小时 | `opencli eastmoney hot-rank` |
| StackOverflow | 每2小时 | `opencli stackoverflow hot` |
| 维基百科热门 | 每2小时 | `opencli wikipedia trending` |
| 国务院政策 | 每2小时 | `opencli gov-policy recent` |
| 最新法规 | 每2小时 | `opencli gov-law recent` |
| arXiv ML | 每2小时 | `opencli arxiv search --query "machine learning"` |
| arXiv LLM | 每2小时 | `opencli arxiv search --query "large language models"` |

## 📁 项目结构

```
public-data-hub/
├── index.html          # 主页面
├── style.css           # 深色科技风样式
├── app.js              # 前端逻辑 + 数据加载
├── data/               # JSON 数据存储（自动生成）
│   ├── index.json      # 数据索引
│   ├── hackernews.json
│   ├── eastmoney-news.json
│   └── ...
├── scripts/
│   └── fetch-data.sh   # OpenCLI 抓取脚本
└── .github/workflows/
    └── fetch-data.yml  # 自动化 workflow
```

## 🛠️ 手动触发数据抓取

前往 GitHub Actions 页面手动运行：

**https://github.com/liudehuaaa600-coder/public-data-hub/actions**

点击 `Fetch OpenCLI Data` → `Run workflow`

## 📦 本地运行

```bash
# 克隆仓库
git clone https://github.com/liudehuaaa600-coder/public-data-hub.git
cd public-data-hub

# 安装 OpenCLI（需要 Node.js 22+）
npm install -g @jackwener/opencli

# 抓取数据
bash scripts/fetch-data.sh

# 本地预览（可用任意静态服务器）
npx serve .
```

## 🔧 自定义数据源

编辑 `scripts/fetch-data.sh`，添加新的 `fetch()` 调用：

```bash
fetch "新数据源名称" "输出文件名.json" opencli命令 --参数
```

## 📜 许可证

MIT License

## 🙏 致谢

- [OpenCLI](https://github.com/jackwener/opencli) — 开源 CLI 数据抓取引擎
- [public-apis](https://github.com/public-apis/public-apis) — 公开 API 资源库
- [Open-Meteo](https://open-meteo.com/) — 免费天气 API

---

Made with ❤️ by AI Agent