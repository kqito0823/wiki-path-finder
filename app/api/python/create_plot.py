# ------------------------------------------------------------------------------------------------------------
#   create_data.pyの次にこのcreate_plot.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------

import psycopg2
from dotenv import load_dotenv
import os
import random
from main import finder
from pathlib import Path
import json
import time

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("SELECT node_id FROM nodes WHERE is_redirect = false and is_orphan = false")
node = {r[0] for r in cur.fetchall()}
print(len(node))


def save():
    output_path = Path(__file__).resolve().parents[3] / "content" / "plot.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)


# 試行回数
trial = 50_000
node_list = list(node)
result = {
    "trial": {"total": trial, "over_7": 0, "timer": 0},
    "data": {},
}
starts = random.sample(node_list, trial)
goals = random.sample(node_list, trial)

# タイマースタート
time_start = time.perf_counter()
for i, (s, g) in enumerate(zip(starts, goals), start=1):
    path = finder(s, g, cur)
    if path[0] == "7打以上のためエラー":
        result["trial"]["over_7"] += 1
        continue
    for node_id in path[1:-1]:
        if node_id not in result["data"]:
            if node_id in node:
                result["data"][node_id] = 1
        else:
            result["data"][node_id] += 1
    if i % 1_000 == 0:
        print(f"{i}回試行")
        save()

save()
# タイマー終了
time_end = time.perf_counter()
cur.close()
conn.close()

result["trial"]["timer"] = time_end - time_start
output_path = Path(__file__).resolve().parents[3] / "content" / "plot.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# ------------------------------------------------------------------------------------------------------------
#   次にcontent/create_pruned_plot.py
# ------------------------------------------------------------------------------------------------------------
