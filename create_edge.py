# ------------------------------------------------------------------------------------------------------------
#   このpythonと同じフォルダ内にwikipedia-foundationのjawiki-latest-pages-articles.xmlを必ず入れる
# ------------------------------------------------------------------------------------------------------------
#   create_node.pyの次にこのcreate_edge.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------

import xml.etree.ElementTree as ET
import re
import psycopg2
import io
from dotenv import load_dotenv
import os


load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
# 最速insert   "copy"
buf = io.StringIO()

# いったん過去の記録を削除
cur.execute("DELETE FROM edges")
conn.commit()

# edgeDBにつけたインデックスは更新の都度張りなおすので重い。一旦外す
cur.execute("SELECT indexname FROM pg_indexes WHERE tablename = 'edges'")
indexes = cur.fetchall()
for (idx_name,) in indexes:
    cur.execute(f"DROP INDEX IF EXISTS {idx_name}")
conn.commit()
print("インデックス削除完了")

# 参照用にnodeDBをメモリに保存
cur.execute("""SELECT name, node_id FROM nodes""")
title_dict = dict(cur.fetchall())
print("取り出し完了")

path = "jawiki-latest-pages-articles.xml"

result = []
processed = 0
is_redirect_list = []
for event, elem in ET.iterparse(path, events=("end",)):
    if elem.tag.endswith("page"):
        title = elem.find("{*}title").text
        ns = elem.find("{*}ns").text
        title = title.replace(" ", "_")
        if int(ns) == 0:
            is_redirect = elem.find("{*}redirect") is not None
            text_elem = elem.find(".//{*}text")
            text = text_elem.text if text_elem is not None else ""
            # タイトルをIDに変換
            title_id = title_dict.get(title)
            # タイトルIDも本文もある場合
            if title_id is not None and text:
                # リダイレクトであればそれを記憶。forのあとにupdate
                if is_redirect:
                    is_redirect_list.append(title_id)
                # コメントアウトを削除
                text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
                # <ref></ref>内にリンクが存在する場合があるので削除
                text = re.sub(r"<ref[^>]*>.*?</ref>", "", text, flags=re.DOTALL)
                text = re.sub(r"<ref[^/]*/>", "", text)
                while True:
                    new_text = re.sub(r"\{\{[^{}]*\}\}", "", text)
                    if new_text == text:
                        break
                    text = new_text

                start = 0
                link_id_list = set()
                # リンクを取り出してく
                while True:
                    start_tag = text.find("[[", start)

                    if start_tag == -1:
                        break

                    end_tag = text.find("]]", start_tag + 2)

                    if end_tag == -1:
                        break

                    link_word = text[start_tag + 2 : end_tag]

                    # リンクのフォーマットをDBに保存された形に合わせる
                    # リダイレクトは[[記事|表示]]のフォーマットで書いてあるのでいらない部分を削除
                    link_word = link_word.split("|")[0]
                    # [[記事#記事内位置]]という記事の中の場所まで指定する場合があるのでいらない部分を削除
                    link_word = link_word.split("#")[0]
                    # スネークケースに変換
                    link_word = link_word.replace(" ", "_")

                    # リンクをIDに変換
                    link_id = title_dict.get(link_word)
                    # リンクＩＤがある、かつ今まで記事内で一度も出ていない場合
                    if link_id is not None:
                        link_id_list.add(link_id)
                    start = end_tag + 2
                # タイトルＩＤとリストＩＤを合体
                for li in link_id_list:
                    result.append({"title_id": title_id, "link_id": li})
            elem.clear()
            processed += 1
    # 一気に入れるとパンクするのでちょっとずつ
    if len(result) >= 2000000:
        print(f"{processed}個の記事の処理完了")
        for edge in result:
            buf.write(f"{edge['title_id']}\t{edge['link_id']}\n")
        buf.seek(0)
        cur.copy_from(buf, "edges", columns=("from_node", "to_node"))
        conn.commit()
        print(f"{processed}個の記事の保存完了")
        print(f"{len(is_redirect_list)}件のリダイレクトを保存")
        result = []
        buf = io.StringIO()
        print("\n")
# 残り
if result:
    for edge in result:
        buf.write(f"{edge['title_id']}\t{edge['link_id']}\n")
    buf.seek(0)
    cur.copy_from(buf, "edges", columns=("from_node", "to_node"))
    conn.commit()
print(f"最終処理記事数{processed}")

# is_redirect初期化
cur.execute("UPDATE nodes SET is_redirect=FALSE")
# is_redirect更新
cur.execute(
    "UPDATE nodes SET is_redirect=TRUE WHERE node_id = ANY(%s)", (is_redirect_list,)
)
conn.commit()
print("リダイレクト登録完了")

# edgeDBのインデックスを再度付加
cur.execute("CREATE INDEX idx_edges_from ON edges(from_node)")
cur.execute("CREATE INDEX idx_edges_to ON edges(to_node)")
conn.commit()
print("インデックス再作成完了")

# 記事の中には、どこからもリンクされない記事(orphan)が数％存在する。nodeに登録
cur.execute("UPDATE nodes SET is_orphan = FALSE;")
cur.execute(
    "UPDATE nodes SET is_orphan = TRUE WHERE node_id NOT IN (SELECT DISTINCT to_node FROM edges);"
)
conn.commit()
print("オーファン登録完了")
print("================\n終了\n================")

# ------------------------------------------------------------------------------------------------------------
#   次にcontent/create_data.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------
#   jawiki-latest-all-titles.gz,jawiki-latest-pages-articles.xmlはレンダリングに影響するので必ず破棄してください
# ------------------------------------------------------------------------------------------------------------
