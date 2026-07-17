# API側もtypescriptで賄おうとした
# しかし、typescriptではクエリを投げるたびに、DBの接続と切断をするため、信じられないくらい時間かかった
# ということでFastAPIで高速化を実現！！！
# app/api/python/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from dotenv import load_dotenv
import os
from algorithm import finder, path_translater

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://wiki-path-finder-one.vercel.app"],
    allow_methods=["GET"],
)


# ユーザーの入力が存在するか
@app.get("/search_node")
def search_db(name: str, sg: str):
    name = name.replace(" ", "_")
    if sg == "start":
        cur.execute(
            """
            SELECT node_id, name, is_redirect, is_orphan
            FROM nodes
            WHERE name LIKE %s
            ORDER BY (name = %s) DESC
            LIMIT 50
            """,
            (f"{name}%", name),
        )
    elif sg == "goal":
        cur.execute(
            """
            SELECT node_id, name, is_redirect, is_orphan
            FROM nodes
            WHERE name LIKE %s AND is_orphan = FALSE
            ORDER BY (name = %s) DESC
            LIMIT 50
            """,
            (f"{name}%", name),
        )
    result = cur.fetchall()
    # 近似一致が何もなければ削除
    if not result:
        return {"error": "No result"}
    # 一見ずつ確認
    return [
        {"node_id": row[0], "name": row[1], "is_redirect": row[2], "is_orphan": row[3]}
        for row in result
    ]


# リダイレクト先を見に行く
@app.get("/search_redirect")
def search_redirect(id: str):
    try:
        id = int(id)
    except ValueError:
        return {"error": "Not integer"}
    cur.execute(
        """
        SELECT name
        FROM nodes
        WHERE node_id in (
                SELECT to_node
                FROM edges
                WHERE from_node = %s
            )
        """,
        (id,),
    )
    result = cur.fetchone()
    if not result:
        return {"error": "No result"}
    return {"name": result[0]}


# 探索
@app.get("/get_path")
def get_path(s: str, g: str):
    # ユーザー入力をIDに変換
    cur.execute("SELECT node_id FROM nodes WHERE name = %s", (s,))
    start = cur.fetchone()
    cur.execute("SELECT node_id,is_orphan FROM nodes WHERE name = %s", (g,))
    gresult = cur.fetchone()

    # ユーザー入力が存在しない場合は、エラー
    if not start or not gresult:
        return {"error": "Node not found"}

    # orphan(誰からもリンクされていない孤立記事)である場合は、エラー
    goal, is_orphan = gresult
    if is_orphan:
        return {"error": "Goal node is Orphan"}

    path = finder(start[0], goal)
    if path[0] == "7打以上のためエラー":
        return {"error": "path not exist"}
    named_path = path_translater(path)
    return {"path": named_path}
