# ------------------------------------------------------------------------------------------------------------
#   このpythonと同じフォルダ内にwikipedia-foundationのjawiki-latest-all-titles.gzを必ず入れる
# ------------------------------------------------------------------------------------------------------------
#   一番最初にこのcreate_node.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------
import gzip
import psycopg2
from dotenv import load_dotenv
import os


load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# node DBをいったん削除
cur.execute("DELETE FROM nodes")
conn.commit()

batch = []
# node DBの主キー
key = 0
with gzip.open("jawiki-latest-all-titles.gz", "rt", encoding="utf-8") as f:
    next(f)

    for line in f:
        ns, title = line.rstrip("\n").split("\t")

        if int(ns) == 0:
            title = title.replace(" ", "_")
            batch.append((key, title))
            key += 1

        # 一気に入れると重いから、ちょっとずつ入れていく
        if len(batch) >= 1000:
            cur.executemany(
                "INSERT INTO nodes VALUES (%s, %s) ON CONFLICT DO NOTHING", batch
            )
            conn.commit()
            batch.clear()

# 残りを挿入
if batch:
    cur.executemany("INSERT INTO nodes VALUES (%s, %s) ON CONFLICT DO NOTHING", batch)
    conn.commit()

conn.close()


# ------------------------------------------------------------------------------------------------------------
#   次にcreate_edge.pyを実行して下さい
# ------------------------------------------------------------------------------------------------------------
