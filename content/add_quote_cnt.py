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


list_data = [[k, v] for k, v in json_data["data"].items()]
# 剪定
pruned_data = {}
value_set = set()
for ld in list_data:
    if ld[1] not in value_set:
        pruned_data[ld[0]] = {"freq": ld[1]}
        value_set.add(ld[1])

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
