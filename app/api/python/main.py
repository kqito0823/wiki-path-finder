# API側もtypescriptで賄おうとした
# しかし、typescriptではクエリを投げるたびに、DBの接続と切断をするため、信じられないくらい時間かかった
# ということでFastAPIで高速化を実現！！！
# app/api/python/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL, sslmode="require")
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
    print(result, flush=True)
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
        print("記事が存在しません")
        return {"error": "Node not found"}

    # orphan(誰からもリンクされていない孤立記事)である場合は、エラー
    goal, is_orphan = gresult
    if is_orphan:
        print("ゴールにたどり着けません")
        return {"error": "Goal node is Orphan"}

    path = finder(start[0], goal)
    if path[0] == "7打以上のためエラー":
        return {"error": "path not exist"}
    named_path = path_translater(path)
    return {"path": named_path}


def parent_connector(meet_node, fore_parent, back_parent):
    # 正方向
    fore_path = [meet_node]
    # スタートはparent内にkeyとして持たないので、それまで
    while fore_path[-1] in fore_parent:
        fore_path.append(fore_parent[fore_path[-1]])
    fore_path.reverse()

    # 逆方向
    back_path = []
    node = meet_node
    while node in back_parent:
        node = back_parent[node]
        back_path.append(node)

    return fore_path + back_path


# 双方向幅優先探索
def finder(s, g):
    # 処理中の最も深い層のノードすべて
    fore_frontier = {s}
    back_frontier = {g}

    # パスが見つかった時に,逆走してpathを作成する用の親子関係記録。{子ノード:親ノード,}の形で記憶する。
    fore_parent = {}
    back_parent = {}

    # 一つの層の中で見つかった経路の中で最小のものを保存
    min_path_length = float("inf")
    min_path = None

    # 最短経路が6打超過のものは強制終了。誰からもリンクとして引用されない記事が存在するため。
    for depth in range(3):
        # 正方向
        # 今の層すべて渡して次の層をすべて取得。INでもいいんだけどgeminiさんに「ANYならpython側の型変換が楽になるよ」と言っていただけたので
        query = "SELECT from_node, to_node FROM edges WHERE from_node = ANY(%s)"
        cur.execute(query, (list(fore_frontier),))
        # 下階層のすべてのノードを保存する
        next_frontier = set()
        # 子ノードを一つずつ見ていく
        for from_node, to_node in cur.fetchall():
            # 既に参照したことがあるものではないかを見る。無限ループを防ぐことができる
            if to_node not in fore_parent and to_node != s:
                # parent[子ノード]に親ノードを入れる。参照した記録を残す
                fore_parent[to_node] = from_node

                # 子ノードを保存
                next_frontier.add(to_node)

                # 相手の網（back_parent）に引っかかったら即終了
                if to_node in back_parent or to_node == g:
                    # 片方向BFSだと最初に見つかったやつが最短経路なんだけど、双方向だと一つの層のすべて見てからじゃないと最短とは言えない。
                    # 双方向の経路をつなげる
                    candidate_path = parent_connector(to_node, fore_parent, back_parent)
                    # 暫定最小か判定
                    if min_path_length > len(candidate_path):
                        # 暫定最小の長さを保存
                        min_path_length = len(candidate_path)
                        # 暫定最小の経路を保存
                        min_path = candidate_path
        if min_path:
            return min_path
        # 層を一個下げる
        fore_frontier = next_frontier

        # 逆方向も然り
        query = "SELECT to_node, from_node FROM edges WHERE to_node = ANY(%s)"
        cur.execute(query, (list(back_frontier),))
        next_frontier = set()
        for to_node, from_node in cur.fetchall():
            if from_node not in back_parent and from_node != g:
                back_parent[from_node] = to_node
                next_frontier.add(from_node)
                if from_node in fore_parent or from_node == s:
                    candidate_path = parent_connector(
                        from_node, fore_parent, back_parent
                    )
                    if min_path_length > len(candidate_path):
                        min_path_length = len(candidate_path)
                        min_path = candidate_path
        if min_path:
            return min_path
        back_frontier = next_frontier
    return ["7打以上のためエラー"]


# idの状態をnameに変換する
def path_translater(path):
    translated = []
    for node_id in path:
        cur.execute("SELECT name FROM nodes WHERE node_id = %s", (node_id,))
        translated.append(cur.fetchone()[0])
    return translated
