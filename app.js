// ========== Weather & Time ==========
const BEIJING_LAT = 39.9042;
const BEIJING_LON = 116.4074;

async function fetchWeather() {
    const card = document.getElementById('weather-card');
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${BEIJING_LAT}&longitude=${BEIJING_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FShanghai`
        );
        const data = await res.json();
        const current = data.current;
        
        const weatherCodes = {
            0: { icon: '☀️', desc: '晴' }, 1: { icon: '🌤️', desc: '大部晴朗' },
            2: { icon: '⛅', desc: '多云' }, 3: { icon: '☁️', desc: '阴天' },
            45: { icon: '🌫️', desc: '雾' }, 48: { icon: '🌫️', desc: '雾凇' },
            51: { icon: '🌦️', desc: '小毛毛雨' }, 53: { icon: '🌦️', desc: '毛毛雨' },
            55: { icon: '🌦️', desc: '大毛毛雨' }, 61: { icon: '🌧️', desc: '小雨' },
            63: { icon: '🌧️', desc: '中雨' }, 65: { icon: '🌧️', desc: '大雨' },
            71: { icon: '🌨️', desc: '小雪' }, 73: { icon: '🌨️', desc: '中雪' },
            75: { icon: '❄️', desc: '大雪' }, 80: { icon: '🌦️', desc: '阵雨' },
            81: { icon: '🌧️', desc: '中阵雨' }, 82: { icon: '⛈️', desc: '大阵雨' },
            95: { icon: '⛈️', desc: '雷暴' }, 96: { icon: '⛈️', desc: '雷暴冰雹' },
            99: { icon: '⛈️', desc: '强雷暴冰雹' }
        };
        const wc = weatherCodes[current.weather_code] || { icon: '🌡️', desc: '未知' };
        card.innerHTML = `
            <div class="weather-content">
                <div>
                    <div class="weather-icon">${wc.icon}</div>
                    <div class="weather-info">
                        <div class="weather-temp">${current.temperature_2m}°C</div>
                        <div class="weather-desc">北京 · ${wc.desc}</div>
                        <div class="weather-meta">
                            <span>💧 湿度 ${current.relative_humidity_2m}%</span>
                            <span>🌬️ 风速 ${current.wind_speed_10m} km/h</span>
                        </div>
                    </div>
                </div>
                <div class="time-display">
                    <div class="date" id="date-display"></div>
                    <div class="time" id="time-display"></div>
                </div>
            </div>`;
    } catch (e) {
        card.innerHTML = `<div class="weather-content"><span class="weather-icon">🌡️</span><div class="weather-info"><div class="weather-temp">--°C</div><div class="weather-desc">天气数据加载失败</div></div><div class="time-display"><div class="date" id="date-display"></div><div class="time" id="time-display"></div></div></div>`;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const bjTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const dateEl = document.getElementById('date-display');
    const timeEl = document.getElementById('time-display');
    if (dateEl) dateEl.textContent = `${bjTime.getFullYear()}年${bjTime.getMonth() + 1}月${bjTime.getDate()}日 ${days[bjTime.getDay()]}`;
    if (timeEl) timeEl.textContent = bjTime.toTimeString().slice(0, 8);
}

// ========== Load OpenCLI JSON Data ==========
async function loadJSON(name) {
    try {
        const res = await fetch(`data/${name}.json`);
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}

async function loadIndex() {
    try {
        const res = await fetch('data/index.json');
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}

// ========== Render Hot Lists ==========
async function renderHotLists() {
    const grid = document.getElementById('hot-grid');
    const statusEl = document.getElementById('data-status');
    const index = await loadIndex();

    // Check data freshness
    if (index && index.updated) {
        const updated = new Date(index.updated);
        const now = new Date();
        const hoursAgo = (now - updated) / 1000 / 3600;
        statusEl.innerHTML = `<span class="status-dot"></span><span>数据状态: ${index.sources.length} 个数据源 · ${hoursAgo < 1 ? '刚刚更新' : Math.floor(hoursAgo) + ' 小时前更新'}</span>`;
        
        const updateInfo = document.getElementById('update-info');
        if (updateInfo) updateInfo.textContent = `数据更新时间: ${new Date(index.updated).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
    } else {
        statusEl.classList.add('error');
        statusEl.innerHTML = `<span class="status-dot"></span><span>数据状态: 暂无 OpenCLI 抓取数据（GitHub Actions 首次运行中...）</span>`;
    }

    const cards = [];

    // 1. HackerNews Top
    const hn = await loadJSON('hackernews');
    if (hn && hn.data) {
        const items = Array.isArray(hn.data) ? hn.data : hn.data.items || [];
        cards.push(renderHotCard('🟠', 'Hacker News 热榜', 'hackernews', items, {
            title: d => d.title || d.text || '',
            link: d => d.url || d.link || `https://news.ycombinator.com/item?id=${d.id}`,
            meta: d => [`⬆️ ${d.score || d.points || 0}`, `💬 ${d.comments || d.descendants || 0}`, d.by || d.author || '']
        }));
    }

    // 2. EastMoney 财经快讯
    const emNews = await loadJSON('eastmoney-news');
    if (emNews && emNews.data) {
        const items = Array.isArray(emNews.data) ? emNews.data : [];
        cards.push(renderHotCard('💰', '东方财富 财经快讯', 'eastmoney', items.slice(0, 15), {
            title: d => d.title || d.digest || d.content?.slice(0, 60) || '',
            link: d => d.url || d.link || '#',
            meta: d => [d.time || d.showtime || '', d.source || '']
        }));
    }

    // 3. EastMoney 热股榜
    const emHot = await loadJSON('eastmoney-hot');
    if (emHot && emHot.data) {
        const items = Array.isArray(emHot.data) ? emHot.data : [];
        cards.push(renderHotCard('📈', '东方财富 热股榜', 'eastmoney', items.slice(0, 15), {
            title: d => d.name || d.title || d.sname || '',
            link: d => d.url || d.link || '#',
            meta: d => [`涨跌幅 ${(d.changePercent || d.zdf || 0).toFixed(2)}%`, d.code || '']
        }));
    }

    // 4. StackOverflow Hot
    const so = await loadJSON('stackoverflow');
    if (so && so.data) {
        const items = Array.isArray(so.data) ? so.data : [];
        cards.push(renderHotCard('📋', 'Stack Overflow 热门', 'stackoverflow', items.slice(0, 15), {
            title: d => d.title || d.question || '',
            link: d => d.url || d.link || `https://stackoverflow.com/questions/${d.question_id || d.id}`,
            meta: d => [`⬆️ ${d.score || 0}`, `💬 ${d.answer_count || d.answers || 0}`, `👁️ ${d.views || 0}`, d.tags ? d.tags.slice(0, 2).join(' ') : '']
        }));
    }

    // 5. Gov Policy
    const govPolicy = await loadJSON('gov-policy');
    if (govPolicy && govPolicy.data) {
        const items = Array.isArray(govPolicy.data) ? govPolicy.data : [];
        cards.push(renderHotCard('🏛️', '国务院 最新政策', 'gov-policy', items.slice(0, 15), {
            title: d => d.title || d.name || '',
            link: d => d.url || d.link || '#',
            meta: d => [d.date || d.publishDate || '', d.source || d.department || '']
        }));
    }

    // 6. Gov Law
    const govLaw = await loadJSON('gov-law');
    if (govLaw && govLaw.data) {
        const items = Array.isArray(govLaw.data) ? govLaw.data : [];
        cards.push(renderHotCard('⚖️', '最新法律法规', 'gov-law', items.slice(0, 15), {
            title: d => d.title || d.name || '',
            link: d => d.url || d.link || '#',
            meta: d => [d.date || d.publishDate || '', d.issuer || d.department || '']
        }));
    }

    // 7. Wikipedia Trending
    const wiki = await loadJSON('wikipedia');
    if (wiki && wiki.data) {
        const items = Array.isArray(wiki.data) ? wiki.data : [];
        cards.push(renderHotCard('📖', '维基百科 热门阅读', 'wikipedia', items.slice(0, 15), {
            title: d => d.title || d.article || d.name || '',
            link: d => d.url || d.link || `https://en.wikipedia.org/wiki/${encodeURIComponent(d.title || d.article || '')}`,
            meta: d => [typeof d.views === 'number' ? `👁️ ${d.views.toLocaleString()}` : '', d.rank || '']
        }));
    }

    // 8. arXiv ML
    const arxivML = await loadJSON('arxiv-ml');
    if (arxivML && arxivML.data) {
        const items = Array.isArray(arxivML.data) ? arxivML.data : [];
        cards.push(renderHotCard('🤖', 'arXiv 最新 ML 论文', 'arxiv', items.slice(0, 10), {
            title: d => d.title || d.name || '',
            link: d => d.url || d.link || d.id ? `https://arxiv.org/abs/${d.id}` : '#',
            meta: d => [d.authors ? d.authors.slice(0, 2).join(', ') : '', d.published || d.date || '', d.category || '']
        }));
    }

    if (cards.length > 0) {
        grid.innerHTML = cards.join('');
    } else {
        grid.innerHTML = `
            <div class="hot-card loading" style="grid-column: 1/-1">
                <h3>📡 数据加载中</h3>
                <p>首次部署后，GitHub Actions 将每2小时通过 OpenCLI 自动抓取数据。</p>
                <p style="margin-top:10px;">你也可以前往仓库 Actions 页面手动触发：</p>
                <a href="https://github.com/liudehuaaa600-coder/public-data-hub/actions" target="_blank" style="color:#00d4ff;margin-top:8px;display:inline-block;">👉 点击手动触发抓取</a>
            </div>`;
    }
}

function renderHotCard(icon, title, source, items, { title: getTitle, link: getLink, meta: getMeta }) {
    if (!items || items.length === 0) return '';
    const listHTML = items.slice(0, 15).map((item, i) => {
        const t = getTitle(item);
        const l = getLink(item);
        const m = getMeta(item).filter(Boolean);
        const rankClass = i < 3 ? ` rank-${i + 1}` : '';
        return `<li class="hot-item">
            <div class="hot-rank${rankClass}">${i + 1}</div>
            <div class="hot-content">
                <div class="hot-title"><a href="${l}" target="_blank" rel="noopener">${escapeHTML(t)}</a></div>
                ${m.length ? `<div class="hot-meta">${m.map(v => `<span>${escapeHTML(v)}</span>`).join('')}</div>` : ''}
            </div>
        </li>`;
    }).join('');
    return `<div class="hot-card">
        <h3><span class="icon">${icon}</span> ${title} <span class="source-badge">${items.length} 条</span></h3>
        <ul class="hot-list">${listHTML}</ul>
    </div>`;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== Render Gov Realtime Data ==========
async function renderGovRealtime() {
    const container = document.getElementById('gov-cards');
    const policy = await loadJSON('gov-policy');
    const law = await loadJSON('gov-law');
    const items = [];

    if (policy && policy.data) {
        (Array.isArray(policy.data) ? policy.data : []).slice(0, 6).forEach(d => {
            items.push({ title: d.title || d.name, desc: d.date || d.publishDate || '', url: d.url || '#', tag: '政策' });
        });
    }
    if (law && law.data) {
        (Array.isArray(law.data) ? law.data : []).slice(0, 6).forEach(d => {
            items.push({ title: d.title || d.name, desc: d.issuer || d.department || '', url: d.url || '#', tag: '法规' });
        });
    }

    if (items.length > 0) {
        container.innerHTML = items.map(d => `
            <a href="${d.url}" target="_blank" class="gov-item">
                <h4><span style="color:#22c55e">[${d.tag}]</span> ${escapeHTML(d.title)}</h4>
                <p>${escapeHTML(d.desc)}</p>
            </a>`).join('');
    } else {
        container.innerHTML = '<p style="color:#666">等待 OpenCLI 首次抓取数据...</p>';
    }
}

// ========== Render Academic Realtime ==========
async function renderAcademicRealtime() {
    const container = document.getElementById('paper-cards');
    const ml = await loadJSON('arxiv-ml');
    const llm = await loadJSON('arxiv-llm');
    const items = [];

    const addPapers = (data, label) => {
        if (data && data.data) {
            (Array.isArray(data.data) ? data.data : []).slice(0, 5).forEach(d => {
                items.push({
                    title: d.title || d.name || '',
                    authors: d.authors ? (Array.isArray(d.authors) ? d.authors.slice(0, 3).join(', ') : d.authors) : '',
                    date: d.published || d.date || '',
                    url: d.url || d.link || (d.id ? `https://arxiv.org/abs/${d.id}` : '#'),
                    tag: label
                });
            });
        }
    };
    addPapers(ml, 'ML');
    addPapers(llm, 'LLM');

    if (items.length > 0) {
        container.innerHTML = items.map(d => `
            <a href="${d.url}" target="_blank" class="paper-item">
                <h4><span style="color:#a78bfa">[${d.tag}]</span> ${escapeHTML(d.title)}</h4>
                <p>${escapeHTML(d.authors)}</p>
                <div class="paper-authors">${escapeHTML(d.date)}</div>
            </a>`).join('');
    } else {
        container.innerHTML = '<p style="color:#666">等待 OpenCLI 首次抓取论文数据...</p>';
    }
}

// ========== Government Data (static portal list) ==========
const govData = [
    { name: '中国政府数据', desc: '国家数据门户', url: 'https://data.gov.cn/', region: 'china', flag: '🇨🇳' },
    { name: '中国专利公布公告', desc: '国家知识产权局', url: 'https://pss-system.cponline.cnipa.gov.cn/', region: 'china', flag: '🇨🇳' },
    { name: '国家统计局', desc: '经济社会统计数据', url: 'https://www.stats.gov.cn/', region: 'china', flag: '🇨🇳' },
    { name: '台湾政府开放数据', desc: '台湾地区开放数据', url: 'https://data.gov.tw/', region: 'asia', flag: '🇹🇼' },
    { name: '新加坡政府数据', desc: 'Singapore Open Data', url: 'https://data.gov.sg/', region: 'asia', flag: '🇸🇬' },
    { name: '韩国政府数据', desc: 'Korea Open Data', url: 'https://www.data.go.kr/', region: 'asia', flag: '🇰🇷' },
    { name: '印度 API Setu', desc: '印度政府API平台', url: 'https://www.apisetu.gov.in/', region: 'asia', flag: '🇮🇳' },
    { name: '香港天文台', desc: '天气、地震、气候数据', url: 'https://www.hko.gov.hk/', region: 'china', flag: '🇭🇰' },
    { name: '英国政府数据', desc: 'UK Government Open Data', url: 'https://data.gov.uk/', region: 'europe', flag: '🇬🇧' },
    { name: '法国政府数据', desc: 'French Open Data', url: 'https://www.data.gouv.fr/', region: 'europe', flag: '🇫🇷' },
    { name: '德国政府数据', desc: 'Germany Open Data', url: 'https://www.govdata.de/', region: 'europe', flag: '🇩🇪' },
    { name: '欧盟开放数据', desc: 'EU Open Data Portal', url: 'https://data.europa.eu/', region: 'europe', flag: '🇪🇺' },
    { name: '美国政府数据', desc: 'US Government Open Data', url: 'https://www.data.gov/', region: 'america', flag: '🇺🇸' },
    { name: '美国人口普查', desc: 'US Census Bureau APIs', url: 'https://www.census.gov/data/developers/', region: 'america', flag: '🇺🇸' },
    { name: '纽约市开放数据', desc: 'NYC Open Data', url: 'https://opendata.cityofnewyork.us/', region: 'america', flag: '🇺🇸' },
    { name: '多伦多市数据', desc: 'Toronto Open Data (CORS)', url: 'https://open.toronto.ca/', region: 'america', flag: '🇨🇦' },
    { name: '加拿大政府数据', desc: 'Canadian Open Data', url: 'https://open.canada.ca/', region: 'america', flag: '🇨🇦' },
    { name: '巴西政府API', desc: 'Brazil Public Data (CORS)', url: 'https://brasilapi.com.br/', region: 'america', flag: '🇧🇷' },
    { name: '澳大利亚政府数据', desc: 'Australian Open Data', url: 'https://www.data.gov.au/', region: 'asia', flag: '🇦🇺' },
    { name: '新西兰政府数据', desc: 'New Zealand Open Data', url: 'https://www.data.govt.nz/', region: 'asia', flag: '🇳🇿' },
];

let currentRegion = 'all';

function renderGovCards(filter = '', region = 'all') {
    const grid = document.getElementById('gov-grid');
    let filtered = govData;
    if (region !== 'all') filtered = filtered.filter(d => d.region === region);
    if (filter) {
        const kw = filter.toLowerCase();
        filtered = filtered.filter(d => d.name.toLowerCase().includes(kw) || d.desc.toLowerCase().includes(kw) || d.region.includes(kw));
    }
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="text-align:center;color:#666;padding:40px;">没有找到匹配的数据源</div>';
        return;
    }
    grid.innerHTML = filtered.map(d => `
        <a href="${d.url}" target="_blank" class="data-card">
            <h4>${d.flag} ${d.name}</h4>
            <p>${d.desc}</p>
            <span class="badge">访问 →</span>
        </a>`).join('');
}

// ========== Patent Search ==========
document.getElementById('patent-btn')?.addEventListener('click', searchPatents);
document.getElementById('patent-search')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchPatents(); });

function searchPatents() {
    const query = document.getElementById('patent-search').value.trim();
    if (!query) return;
    const results = document.getElementById('patent-results');
    results.innerHTML = `<h3 style="color:#fff;margin-bottom:15px;">🔍 搜索结果: "${escapeHTML(query)}"</h3>
        <div style="color:#aaa;margin-bottom:20px;">点击下方链接在专业平台搜索:</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            <a href="https://patents.google.com/?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>🔍 Google Patents 搜索</h4><p>全球专利全文搜索</p><span class="badge free">点击搜索</span></a>
            <a href="https://patentsview.org/search/text/${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>📊 PatentsView 可视化</h4><p>美国专利数据分析</p><span class="badge free">点击搜索</span></a>
            <a href="https://worldwide.espacenet.com/searchResults?query=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>🌐 Espacenet 全球专利</h4><p>欧洲专利局全球数据库</p><span class="badge free">点击搜索</span></a>
            <a href="https://patentscope.wipo.int/search/en/search.jsf?query=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>🌍 WIPO Patentscope</h4><p>世界知识产权组织</p><span class="badge free">点击搜索</span></a>
            <a href="https://pss-system.cponline.cnipa.gov.cn/conventionalSearch?searchWord=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>🇨🇳 中国专利检索</h4><p>国家知识产权局</p><span class="badge cn">点击搜索</span></a>
        </div>`;
}

// ========== Academic Search ==========
document.getElementById('academic-btn')?.addEventListener('click', searchAcademic);
document.getElementById('academic-search')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchAcademic(); });

function searchAcademic() {
    const query = document.getElementById('academic-search').value.trim();
    if (!query) return;
    const results = document.getElementById('academic-results');
    results.innerHTML = `<h3 style="color:#fff;margin-bottom:15px;">📚 搜索结果: "${escapeHTML(query)}"</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
            <a href="https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all" target="_blank" class="data-card" style="display:block;"><h4>📄 arXiv 搜索</h4><p>预印本论文</p><span class="badge free">点击搜索</span></a>
            <a href="https://scholar.google.com/scholar?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>🎓 Google Scholar</h4><p>全球学术搜索</p><span class="badge free">点击搜索</span></a>
            <a href="https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>🤖 Semantic Scholar</h4><p>AI驱动学术搜索</p><span class="badge free">点击搜索</span></a>
            <a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>🧬 PubMed</h4><p>生物医学文献</p><span class="badge free">点击搜索</span></a>
            <a href="https://core.ac.uk/search?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;"><h4>📖 CORE 开放获取</h4><p>全球开放论文</p><span class="badge free">点击搜索</span></a>
        </div>`;
}

// ========== Tab Navigation ==========
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-panel`).classList.add('active');
    });
});

// ========== Filter Buttons ==========
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRegion = btn.dataset.region;
        renderGovCards(document.getElementById('gov-search').value, currentRegion);
    });
});

document.getElementById('gov-search')?.addEventListener('input', (e) => {
    renderGovCards(e.target.value, currentRegion);
});

// ========== Init ==========
fetchWeather();
initProgressTracker();
renderHotLists();
renderGovRealtime();
renderAcademicRealtime();
renderGovCards();

// ========== Progress Tracker ==========
const DATA_SOURCES = [
    { name: 'Hacker News', file: 'hackernews', icon: '🟠' },
    { name: '东方财富快讯', file: 'eastmoney-news', icon: '💰' },
    { name: '东方财富热股', file: 'eastmoney-hot', icon: '📈' },
    { name: 'Stack Overflow', file: 'stackoverflow', icon: '📋' },
    { name: '国务院政策', file: 'gov-policy', icon: '🏛️' },
    { name: '法律法规', file: 'gov-law', icon: '⚖️' },
    { name: '维基百科', file: 'wikipedia', icon: '📖' },
    { name: 'arXiv ML', file: 'arxiv-ml', icon: '🤖' },
    { name: 'arXiv LLM', file: 'arxiv-llm', icon: '🤖' }
];

let loadResults = {};
let progressInitialized = false;

async function initProgressTracker() {
    const detailsEl = document.getElementById('progress-details');
    if (!detailsEl) return;
    
    // 初始化进度列表
    detailsEl.innerHTML = DATA_SOURCES.map(s => `
        <div class="progress-item" id="progress-${s.file}">
            <span class="p-icon">${s.icon}</span>
            <span class="p-name">${s.name}</span>
            <span class="p-count">--</span>
            <span class="p-status pending">等待</span>
        </div>
    `).join('');
    
    progressInitialized = true;
    
    // 开始加载检测
    await checkAllDataSources();
}

async function checkAllDataSources() {
    const total = DATA_SOURCES.length;
    let loaded = 0;
    let failed = 0;
    
    for (const source of DATA_SOURCES) {
        await checkDataSource(source);
        
        const result = loadResults[source.file];
        if (result && result.success) loaded++;
        else failed++;
        
        updateProgressUI(loaded, failed, total);
    }
    
    // 完成后更新状态
    const fillEl = document.getElementById('progress-fill');
    if (fillEl) {
        if (loaded === total) {
            fillEl.classList.add('done');
        } else if (loaded > 0) {
            fillEl.classList.add('partial');
        }
    }
    
    // 更新按钮状态
    const auditBtn = document.getElementById('start-audit');
    if (auditBtn && loaded > 0) {
        auditBtn.disabled = false;
    }
}

async function checkDataSource(source) {
    const itemEl = document.getElementById(`progress-${source.file}`);
    if (!itemEl) return;
    
    const statusEl = itemEl.querySelector('.p-status');
    const countEl = itemEl.querySelector('.p-count');
    
    statusEl.className = 'p-status loading';
    statusEl.textContent = '加载中...';
    
    try {
        const data = await loadJSON(source.file);
        
        if (data && data.data) {
            const items = Array.isArray(data.data) ? data.data : data.data.items || [];
            const count = items.length;
            
            loadResults[source.file] = {
                success: true,
                count: count,
                data: data,
                timestamp: data.updated || null
            };
            
            statusEl.className = 'p-status success';
            statusEl.textContent = '成功';
            countEl.textContent = `${count} 条`;
        } else {
            loadResults[source.file] = { success: false, reason: '无数据' };
            statusEl.className = 'p-status fail';
            statusEl.textContent = '失败';
            countEl.textContent = '0 条';
        }
    } catch (e) {
        loadResults[source.file] = { success: false, reason: e.message };
        statusEl.className = 'p-status fail';
        statusEl.textContent = '失败';
        countEl.textContent = '--';
    }
}

function updateProgressUI(loaded, failed, total) {
    const percent = Math.round((loaded + failed) / total * 100);
    
    const fillEl = document.getElementById('progress-fill');
    const textEl = document.getElementById('progress-text');
    
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (textEl) {
        if (percent === 100) {
            textEl.textContent = '完成';
            textEl.style.color = '#22c55e';
        } else {
            textEl.textContent = `${percent}%`;
        }
    }
}

// ========== Audit Button Handler ==========
document.getElementById('start-audit')?.addEventListener('click', runDataAudit);

async function runDataAudit() {
    const btn = document.getElementById('start-audit');
    const panel = document.getElementById('audit-panel');
    
    if (!panel) return;
    
    btn.classList.add('running');
    btn.textContent = '🔍 审计进行中...';
    
    // 运行审计
    const report = await performAudit();
    
    // 显示结果
    renderAuditReport(report);
    panel.style.display = 'block';
    
    btn.classList.remove('running');
    btn.textContent = '🔍 开始数据审计';
}

async function performAudit() {
    const report = {
        totalSources: DATA_SOURCES.length,
        successCount: 0,
        failCount: 0,
        warningCount: 0,
        totalRecords: 0,
        sources: []
    };
    
    const now = new Date();
    
    for (const source of DATA_SOURCES) {
        const result = loadResults[source.file];
        const auditResult = {
            name: source.name,
            icon: source.icon,
            file: source.file,
            success: result?.success || false,
            count: result?.count || 0,
            score: 0,
            issues: []
        };
        
        if (!result?.success) {
            auditResult.issues.push('数据加载失败');
            auditResult.score = 0;
            report.failCount++;
        } else {
            report.successCount++;
            report.totalRecords += result.count;
            
            // 检查数据量
            if (result.count < 5) {
                auditResult.issues.push('数据量过少');
                auditResult.score += 20;
                report.warningCount++;
            } else if (result.count >= 10) {
                auditResult.score += 40;
            } else {
                auditResult.score += 30;
            }
            
            // 检查时效性
            if (result.timestamp) {
                const updateTime = new Date(result.timestamp);
                const hoursAgo = (now - updateTime) / 1000 / 3600;
                
                if (hoursAgo < 2) {
                    auditResult.score += 30;
                    auditResult.lastUpdate = '刚刚更新';
                } else if (hoursAgo < 24) {
                    auditResult.score += 20;
                    auditResult.lastUpdate = `${Math.floor(hoursAgo)}小时前`;
                } else if (hoursAgo < 72) {
                    auditResult.score += 10;
                    auditResult.issues.push('数据较旧');
                    auditResult.lastUpdate = `${Math.floor(hoursAgo/24)}天前`;
                    report.warningCount++;
                } else {
                    auditResult.issues.push('数据过期');
                    auditResult.lastUpdate = `${Math.floor(hoursAgo/24)}天前`;
                    report.warningCount++;
                }
            } else {
                auditResult.issues.push('无时间戳');
                auditResult.score += 10;
            }
            
            // 检查数据质量
            if (result.data && result.data.data) {
                const items = Array.isArray(result.data.data) ? result.data.data : [];
                const validItems = items.filter(item => {
                    // 检查是否有有效内容
                    const hasTitle = item.title || item.name || item.question;
                    return hasTitle && hasTitle.length > 3;
                });
                
                const validityRate = items.length > 0 ? validItems.length / items.length : 0;
                
                if (validityRate > 0.9) {
                    auditResult.score += 30;
                } else if (validityRate > 0.7) {
                    auditResult.score += 20;
                    auditResult.issues.push(`${Math.round((1-validityRate)*100)}%数据无效`);
                } else {
                    auditResult.score += 10;
                    auditResult.issues.push('数据质量低');
                }
            }
        }
        
        // 确定评分等级
        auditResult.scoreLevel = auditResult.score >= 80 ? 'high' : 
                                  auditResult.score >= 50 ? 'mid' : 'low';
        
        report.sources.push(auditResult);
    }
    
    // 计算整体健康度
    report.healthScore = Math.round(
        (report.successCount / report.totalSources) * 50 +
        (report.totalRecords > 50 ? 30 : report.totalRecords > 20 ? 20 : 10) +
        (report.warningCount < 2 ? 20 : report.warningCount < 5 ? 10 : 0)
    );
    
    return report;
}

function renderAuditReport(report) {
    const summaryEl = document.getElementById('audit-summary');
    const detailsEl = document.getElementById('audit-details');
    
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="audit-stat">
                <span class="stat-num ${report.healthScore >= 70 ? 'green' : report.healthScore >= 40 ? 'yellow' : 'red'}">${report.healthScore}</span>
                <span class="stat-label">健康评分</span>
            </div>
            <div class="audit-stat">
                <span class="stat-num green">${report.successCount}</span>
                <span class="stat-label">成功加载</span>
            </div>
            <div class="audit-stat">
                <span class="stat-num ${report.warningCount > 0 ? 'yellow' : 'green'}">${report.warningCount}</span>
                <span class="stat-label">警告项</span>
            </div>
            <div class="audit-stat">
                <span class="stat-num blue">${report.totalRecords}</span>
                <span class="stat-label">总记录数</span>
            </div>
        `;
    }
    
    if (detailsEl) {
        detailsEl.innerHTML = report.sources.map(s => `
            <div class="audit-row">
                <span class="a-icon">${s.icon}</span>
                <span class="a-source">${s.name}</span>
                <span class="a-score score-${s.scoreLevel}">${s.score}分</span>
                <span class="a-issues">${s.issues.length > 0 ? s.issues.join('; ') : s.lastUpdate || '正常'}</span>
            </div>
        `).join('') + `
            <button class="audit-close-btn" onclick="document.getElementById('audit-panel').style.display='none'">关闭报告</button>
        `;
    }
}
