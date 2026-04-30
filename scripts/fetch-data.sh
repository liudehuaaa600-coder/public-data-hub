#!/bin/bash
# fetch-data.sh — 通过 OpenCLI 抓取各平台公开数据
# 输出 JSON 文件到 data/ 目录，供前端读取

set -euo pipefail

DATA_DIR="./data"
mkdir -p "$DATA_DIR"
cd "$(dirname "$0")/.."

echo "=== OpenCLI Data Fetcher ==="
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# 每个数据源：命令 → JSON 文件
fetch() {
  local name="$1"
  local file="$DATA_DIR/${2:-$name}.json"
  shift 2
  
  echo "Fetching $name..."
  if opencli "$@" -f json > "$file.tmp" 2>/dev/null; then
    # 包装成标准格式: { updated, data: [...] }
    echo "{\"updated\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"source\":\"$name\"}" | \
      python3 -c "
import sys, json
meta = json.load(sys.stdin)
with open('$file.tmp') as f:
    data = json.load(f)
if isinstance(data, list):
    meta['data'] = data
    meta['count'] = len(data)
elif isinstance(data, dict):
    meta['data'] = data
    meta['count'] = len(data.get('items', data.get('results', [])))
else:
    meta['data'] = data
    meta['count'] = 0
print(json.dumps(meta, ensure_ascii=False))
" > "$file"
    rm -f "$file.tmp"
    echo "  ✓ $name → $(python3 -c "import json; print(json.load(open('$file')).get('count',0))" 2>/dev/null || echo '?') items"
  else
    echo "  ✗ $name failed"
    rm -f "$file.tmp"
  fi
}

# ============ 科技与开发热榜 ============
fetch "hackernews-top" "hackernews.json" hackernews top --limit 20

# ============ 学术论文 ============
fetch "arxiv-ml" "arxiv-ml.json" arxiv search --query "machine learning" --limit 10
fetch "arxiv-llm" "arxiv-llm.json" arxiv search --query "large language models" --limit 10

# ============ 中国政府数据 ============
fetch "gov-law" "gov-law.json" gov-law recent --limit 15
fetch "gov-policy" "gov-policy.json" gov-policy recent --limit 15

# ============ 财经数据 ============
fetch "eastmoney-news" "eastmoney-news.json" eastmoney kuaixun --limit 15
fetch "eastmoney-hot" "eastmoney-hot.json" eastmoney hot-rank --limit 15

# ============ 开发社区 ============
fetch "stackoverflow-hot" "stackoverflow.json" stackoverflow hot --limit 15

# ============ 百科 ============
fetch "wikipedia-trending" "wikipedia.json" wikipedia trending --limit 15

# ============ 生成索引 ============
echo "" > "$DATA_DIR/index.json"
python3 -c "
import json, os, glob
from datetime import datetime

index = {'updated': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'), 'sources': []}
for f in sorted(glob.glob('data/*.json')):
    if f == 'data/index.json': continue
    try:
        with open(f) as fp:
            d = json.load(fp)
        name = os.path.basename(f).replace('.json','')
        index['sources'].append({
            'name': name,
            'file': f,
            'count': d.get('count', 0),
            'updated': d.get('updated', '')
        })
    except: pass

print(json.dumps(index, ensure_ascii=False, indent=2))
" > "$DATA_DIR/index.json"

echo ""
echo "=== Done ==="
echo "Files updated:"
ls -la "$DATA_DIR/"*.json 2>/dev/null | awk '{print "  " $NF " (" $5 " bytes)"}'
