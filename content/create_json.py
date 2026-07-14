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
    },
    "ranking": {
        "quoting": ranking(
            "SELECT n.name, e.cnt FROM (SELECT from_node, COUNT(*) AS cnt FROM edges GROUP BY from_node ORDER BY cnt DESC LIMIT 50) AS e JOIN nodes AS n ON e.from_node = n.node_id;"
        ),
        "quoted": ranking(
            "SELECT n.name, e.cnt FROM (SELECT to_node, COUNT(*) AS cnt FROM edges GROUP BY to_node ORDER BY cnt DESC LIMIT 50) AS e JOIN nodes AS n ON e.to_node = n.node_id;"
        ),
    },
}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
