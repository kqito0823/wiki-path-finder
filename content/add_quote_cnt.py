import psycopg2
from dotenv import load_dotenv
import os
import json

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()


with open("plot.json", encoding="utf-8") as f:
    json_data = json.load(f)
with open("quote.json", encoding="utf-8") as f:
    quote = json.load(f)

# ソート
sorted_data = sorted(json_data["data"].items(), key=lambda x: x[1], reverse=True)
print(sorted_data)

# 剪定
step = max(1, round(len(sorted_data) / 1000))
pruned_data = {}

for i in range(0, len(sorted_data), step):
    pruned_data[sorted_data[i][0]] = {"freq": sorted_data[i][1]}

# quoteの追加
for q in quote:
    key = str(q["id"])
    if key in pruned_data:
        pruned_data[key]["quote"] = int(q["cnt"])
print(pruned_data)


result = {
    "num_of_trial": json_data["num_of_trial"],
    "data": pruned_data,
}

with open("pruned_plot.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
