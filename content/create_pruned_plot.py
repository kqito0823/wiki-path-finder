# ------------------------------------------------------------------------------------------------------------
#   create_plot.pyの次にこのcreate_pruned_plot.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------

import psycopg2
from dotenv import load_dotenv
import os
import json
import math

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()


with open("data.json", encoding="utf-8") as f:
    data = json.load(f)
with open("plot.json", encoding="utf-8") as f:
    plot = json.load(f)
with open("quote.json", encoding="utf-8") as f:
    quote = json.load(f)


list_data = [[k, v] for k, v in plot["data"].items()]

# 剪定
pruned_data = {}
value_set = set()
total_quote = 0
for ld in list_data:
    total_quote += ld[1]
    if ld[1] not in value_set:
        pruned_data[ld[0]] = {"freq": ld[1]}
        value_set.add(ld[1])
average_quote = (
    round(total_quote / (plot["trial"]["total"] - plot["trial"]["over_7"]) * 1000)
    / 1000
)

# quoteの追加
for q in quote:
    key = str(q["id"])
    if key in pruned_data:
        pruned_data[key]["quote"] = int(q["cnt"])

quote_data_length = len(plot["data"])
average_link = round(
    int(data["length"]["edges"]["total"]) / int(data["length"]["nodes"]["total"])
)
result = {
    "trial": plot["trial"],
    "quote": {
        "quote_data_length": quote_data_length,
        "average": average_quote,
        "six_degrees": round(
            math.log(data["length"]["nodes"]["available"], average_link) * 1000
        )
        / 1000,
    },
    "data": pruned_data,
}

with open("pruned_plot.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# ------------------------------------------------------------------------------------------------------------
#   データ作成完了です。content/quote.jsonは破棄してかまいません
# ------------------------------------------------------------------------------------------------------------
#   jawiki-latest-all-titles.gz,jawiki-latest-pages-articles.xmlはレンダリングに影響するので必ず破棄してください
# ------------------------------------------------------------------------------------------------------------
