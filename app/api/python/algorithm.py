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
def finder(s, g, cur):
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
def path_translater(path, cur):
    translated = []
    for node_id in path:
        cur.execute("SELECT name FROM nodes WHERE node_id = %s", (node_id,))
        translated.append(cur.fetchone()[0])
    return translated
