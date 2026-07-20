# ------------------------------------------------------------------------------------------------------------
#   create_edge.pyの次にこのcreate_data.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------

import psycopg2
from dotenv import load_dotenv
import os
import json

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()


# 要素数
def count(query):
    cur.execute(query)
    return cur.fetchone()[0]


# ランキング
def ranking(query):
    cur.execute(query)
    return [{"name": r[0], "cnt": r[1]} for r in cur.fetchall()]


# 引用
def quote(query):
    cur.execute(query)
    return [{"id": r[0], "cnt": r[1]} for r in cur.fetchall()]


data = {
    "length": {
        "nodes": {
            "total": count("SELECT count(*) FROM nodes"),
            "available": count("SELECT count(*) FROM nodes WHERE is_redirect = false"),
            "redirect": count("SELECT count(*) FROM nodes WHERE is_redirect"),
            "orphan": count(
                "SELECT count(*) FROM nodes WHERE is_orphan = true AND is_redirect = false"
            ),
        },
        "edges": {
            "total": count("SELECT count(*) FROM edges"),
        },
        "web_nodes": 42914,
    },
    "ranking": {
        "quoting": ranking(
            "SELECT n.name, e.cnt FROM (SELECT from_node, COUNT(*) AS cnt FROM edges GROUP BY from_node ORDER BY cnt DESC LIMIT 100) AS e JOIN nodes AS n ON e.from_node = n.node_id;"
        ),
        "quoted": ranking(
            "SELECT n.name, e.cnt FROM (SELECT to_node, COUNT(*) AS cnt FROM edges GROUP BY to_node ORDER BY cnt DESC LIMIT 100) AS e JOIN nodes AS n ON e.to_node = n.node_id;"
        ),
        "social": ranking(
            "SELECT n.name,c.total_count FROM (SELECT node_id,COUNT(*) AS total_count FROM (SELECT from_node AS node_id FROM edges UNION ALL SELECT to_node AS node_id FROM edges) AS t GROUP BY node_id) AS c JOIN nodes AS n ON n.node_id = c.node_id ORDER BY c.total_count DESC LIMIT 100"
        ),
    },
}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("data.json作成完了")
data = quote(
    "SELECT node_id,COUNT(*) AS total_count FROM (SELECT from_node AS node_id FROM edges UNION ALL SELECT to_node AS node_id FROM edges) AS t GROUP BY node_id ORDER BY total_count DESC"
)
with open("quote.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# ------------------------------------------------------------------------------------------------------------
#   次にapp/api/python/create_plot.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------
