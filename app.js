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
            0: { icon: '☀️', desc: '晴' },
            1: { icon: '🌤️', desc: '大部晴朗' },
            2: { icon: '⛅', desc: '多云' },
            3: { icon: '☁️', desc: '阴天' },
            45: { icon: '🌫️', desc: '雾' },
            48: { icon: '🌫️', desc: '雾凇' },
            51: { icon: '🌦️', desc: '小毛毛雨' },
            53: { icon: '🌦️', desc: '毛毛雨' },
            55: { icon: '🌦️', desc: '大毛毛雨' },
            61: { icon: '🌧️', desc: '小雨' },
            63: { icon: '🌧️', desc: '中雨' },
            65: { icon: '🌧️', desc: '大雨' },
            71: { icon: '🌨️', desc: '小雪' },
            73: { icon: '🌨️', desc: '中雪' },
            75: { icon: '❄️', desc: '大雪' },
            80: { icon: '🌦️', desc: '阵雨' },
            81: { icon: '🌧️', desc: '中阵雨' },
            82: { icon: '⛈️', desc: '大阵雨' },
            95: { icon: '⛈️', desc: '雷暴' },
            96: { icon: '⛈️', desc: '雷暴冰雹' },
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
            </div>
        `;
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
    
    if (dateEl) {
        dateEl.textContent = `${bjTime.getFullYear()}年${bjTime.getMonth() + 1}月${bjTime.getDate()}日 ${days[bjTime.getDay()]}`;
    }
    if (timeEl) {
        timeEl.textContent = bjTime.toTimeString().slice(0, 8);
    }
}

// ========== Government Data ==========
const govData = [
    // China
    { name: '中国政府数据', desc: '中华人民共和国国家数据门户', url: 'https://data.gov.cn/', region: 'china', flag: '🇨🇳' },
    { name: '中国专利公布公告', desc: '国家知识产权局专利检索', url: 'https://pss-system.cponline.cnipa.gov.cn/', region: 'china', flag: '🇨🇳' },
    { name: '国家统计局', desc: '中国经济社会统计数据', url: 'https://www.stats.gov.cn/', region: 'china', flag: '🇨🇳' },
    { name: '台湾政府开放数据', desc: '台湾地区开放数据平台', url: 'https://data.gov.tw/', region: 'asia', flag: '🇹🇼' },
    // Asia
    { name: '新加坡政府数据', desc: 'Singapore Government Open Data', url: 'https://data.gov.sg/', region: 'asia', flag: '🇸🇬' },
    { name: '韩国政府数据', desc: 'Korea Government Open Data', url: 'https://www.data.go.kr/', region: 'asia', flag: '🇰🇷' },
    { name: '日本数据门户', desc: 'Japan Open Data Portal', url: 'https://data.go.jp/', region: 'asia', flag: '🇯🇵' },
    { name: '印度 API Setu', desc: '印度政府API平台（CORS支持）', url: 'https://www.apisetu.gov.in/', region: 'asia', flag: '🇮🇳' },
    { name: '香港天文台', desc: '香港天气、地震、气候数据', url: 'https://www.hko.gov.hk/en/abouthko/opendata_intro.htm', region: 'china', flag: '🇭🇰' },
    // Europe
    { name: '英国政府数据', desc: 'UK Government Open Data', url: 'https://data.gov.uk/', region: 'europe', flag: '🇬🇧' },
    { name: '法国政府数据', desc: 'French Government Open Data', url: 'https://www.data.gouv.fr/', region: 'europe', flag: '🇫🇷' },
    { name: '德国政府数据', desc: 'Germany Government Open Data', url: 'https://www.govdata.de/', region: 'europe', flag: '🇩🇪' },
    { name: '挪威政府数据', desc: 'Norway Government Data (CORS)', url: 'https://data.norge.no/', region: 'europe', flag: '🇳🇴' },
    { name: '欧洲专利局', desc: 'EPO全球专利检索', url: 'https://worldwide.espacenet.com/', region: 'europe', flag: '🇪🇺' },
    { name: '欧盟开放数据', desc: 'European Union Open Data Portal', url: 'https://data.europa.eu/', region: 'europe', flag: '🇪🇺' },
    { name: '波兰政府数据', desc: 'Poland Government Data (CORS)', url: 'https://dane.gov.pl/', region: 'europe', flag: '🇵🇱' },
    // Americas
    { name: '美国政府数据', desc: 'US Government Open Data', url: 'https://www.data.gov/', region: 'america', flag: '🇺🇸' },
    { name: '美国人口普查', desc: 'US Census Bureau APIs', url: 'https://www.census.gov/data/developers/', region: 'america', flag: '🇺🇸' },
    { name: '纽约市开放数据', desc: 'New York City Open Data', url: 'https://opendata.cityofnewyork.us/', region: 'america', flag: '🇺🇸' },
    { name: '多伦多市数据', desc: 'Toronto Open Data (CORS)', url: 'https://open.toronto.ca/', region: 'america', flag: '🇨🇦' },
    { name: '加拿大政府数据', desc: 'Canadian Government Open Data', url: 'https://open.canada.ca/', region: 'america', flag: '🇨🇦' },
    { name: '巴西政府API', desc: 'Brazil Public Data (CORS支持)', url: 'https://brasilapi.com.br/', region: 'america', flag: '🇧🇷' },
    // Others
    { name: '澳大利亚政府数据', desc: 'Australian Government Open Data', url: 'https://www.data.gov.au/', region: 'asia', flag: '🇦🇺' },
    { name: '新西兰政府数据', desc: 'New Zealand Open Data', url: 'https://www.data.govt.nz/', region: 'asia', flag: '🇳🇿' },
];

let currentRegion = 'all';

function renderGovCards(filter = '', region = 'all') {
    const grid = document.getElementById('gov-grid');
    let filtered = govData;
    
    if (region !== 'all') {
        filtered = filtered.filter(d => d.region === region);
    }
    
    if (filter) {
        const kw = filter.toLowerCase();
        filtered = filtered.filter(d => 
            d.name.toLowerCase().includes(kw) || 
            d.desc.toLowerCase().includes(kw) ||
            d.region.includes(kw)
        );
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
        </a>
    `).join('');
}

// ========== Patent Search ==========
document.getElementById('patent-btn')?.addEventListener('click', searchPatents);
document.getElementById('patent-search')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPatents();
});

function searchPatents() {
    const query = document.getElementById('patent-search').value.trim();
    if (!query) return;
    
    const results = document.getElementById('patent-results');
    results.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">搜索中...</div>';
    
    // Try Google Patents as primary
    setTimeout(() => {
        results.innerHTML = `
            <h3 style="color:#fff;margin-bottom:15px;">🔍 搜索结果: "${query}"</h3>
            <div style="color:#aaa;margin-bottom:20px;">点击下方链接在专业平台搜索:</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <a href="https://patents.google.com/?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🔍 Google Patents 搜索</h4>
                    <p>全球专利全文搜索（支持中文）</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://patentsview.org/search/text/${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>📊 PatentsView 可视化搜索</h4>
                    <p>美国专利数据分析</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://worldwide.espacenet.com/searchResults?query=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🌐 Espacenet 全球专利搜索</h4>
                    <p>欧洲专利局全球专利数据库</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://patentscope.wipo.int/search/en/search.jsf?query=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🌍 WIPO Patentscope</h4>
                    <p>世界知识产权组织国际专利</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://pss-system.cponline.cnipa.gov.cn/conventionalSearch?searchWord=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🇨🇳 中国专利检索</h4>
                    <p>中国国家知识产权局</p>
                    <span class="badge cn">点击搜索</span>
                </a>
            </div>
        `;
    }, 500);
}

// ========== Academic Search ==========
document.getElementById('academic-btn')?.addEventListener('click', searchAcademic);
document.getElementById('academic-search')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchAcademic();
});

function searchAcademic() {
    const query = document.getElementById('academic-search').value.trim();
    if (!query) return;
    
    const results = document.getElementById('academic-results');
    results.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">搜索中...</div>';
    
    setTimeout(() => {
        results.innerHTML = `
            <h3 style="color:#fff;margin-bottom:15px;">📚 搜索结果: "${query}"</h3>
            <div style="color:#aaa;margin-bottom:20px;">点击下方链接在学术平台搜索:</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <a href="https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all" target="_blank" class="data-card" style="display:block;">
                    <h4>📄 arXiv 搜索</h4>
                    <p>预印本论文（物理、计算机科学、数学）</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://scholar.google.com/scholar?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🎓 Google Scholar</h4>
                    <p>全球学术搜索引擎</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🤖 Semantic Scholar</h4>
                    <p>AI驱动的学术搜索（有免费API）</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5" target="_blank" class="data-card" style="display:block;">
                    <h4>🔌 Semantic Scholar API (JSON)</h4>
                    <p>直接查看API返回的JSON数据</p>
                    <span class="badge free">API调用</span>
                </a>
                <a href="https://www.cnki.net/kns/brief/default_result.aspx?txt=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🇨🇳 中国知网</h4>
                    <p>中文学术文献数据库</p>
                    <span class="badge cn">点击搜索</span>
                </a>
                <a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>🧬 PubMed</h4>
                    <p>生物医学文献（NIH）</p>
                    <span class="badge free">点击搜索</span>
                </a>
                <a href="https://core.ac.uk/search?q=${encodeURIComponent(query)}" target="_blank" class="data-card" style="display:block;">
                    <h4>📖 CORE 开放获取</h4>
                    <p>全球开放获取论文聚合</p>
                    <span class="badge free">点击搜索</span>
                </a>
            </div>
        `;
    }, 500);
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

// ========== Search Filter ==========
document.getElementById('gov-search')?.addEventListener('input', (e) => {
    renderGovCards(e.target.value, currentRegion);
});

// ========== Init ==========
fetchWeather();
renderGovCards();
