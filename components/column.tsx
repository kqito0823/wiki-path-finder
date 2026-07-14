import data from "@/content/data.json";

export default function ColumnPage() {
  const orphanAverage =
    Math.round(
      (data.length.nodes.orphan / data.length.nodes.available) * 1000,
    ) / 10;
  const linkAverage = Math.round(
    data.length.edges.total / data.length.nodes.total,
  );
  return (
    <main className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-12">
      {/* タイトル & 説明文 */}
      <div
        id="description"
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400 mb-4 flex items-center gap-3">
          <span className="text-3xl">📊</span> Wikipediaデータ分析
        </h2>
        <div className="space-y-2 text-slate-600 font-medium leading-relaxed">
          <p>
            今回開発をする中で、様々なウィキペディアのデータマイニング的なアプローチをしました。
          </p>
          <p>
            ということで、ウィキペディアの「記事」と「リンク」の関係についていろいろまとめてみました！！
          </p>
        </div>
      </div>

      {/* 統計データ (ダッシュボード風グリッド) */}
      <div id="length" className="space-y-6">
        {/* 記事に関する統計 */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3 ml-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            記事の統計
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 総記事数 */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-500 mb-1">総記事数</p>
              <p className="text-3xl font-black text-slate-800">
                {data.length.nodes.available.toLocaleString()}{" "}
                <span className="text-base font-bold text-slate-400">件</span>
              </p>
            </div>

            {/* リダイレクト数 */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-500 mb-1">
                リダイレクト数
              </p>
              <p className="text-3xl font-black text-slate-800">
                {data.length.nodes.redirect.toLocaleString()}{" "}
                <span className="text-base font-bold text-slate-400">件</span>
              </p>
              <p className="text-xs font-medium text-slate-400 mt-2 bg-white px-2 py-1 rounded-md inline-block border border-slate-100">
                ※記事名の表記揺れ
              </p>
            </div>

            {/* 孤立記事 */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold text-slate-500">孤立記事</p>
                <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold tracking-wider">
                  全体 {orphanAverage}%
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800">
                {data.length.nodes.orphan.toLocaleString()}{" "}
                <span className="text-base font-bold text-slate-400">件</span>
              </p>
              <p className="text-xs font-medium text-slate-400 mt-2 bg-white px-2 py-1 rounded-md inline-block border border-slate-100">
                ※他から引用されていない記事
              </p>
            </div>
          </div>
        </div>

        {/* リンクに関する統計 */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3 ml-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            リンクの統計
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-500 mb-1">
                全記事合計
              </p>
              <p className="text-3xl font-black text-slate-800">
                {data.length.edges.total.toLocaleString()}{" "}
                <span className="text-base font-bold text-slate-400">個</span>
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-500 mb-1">
                一記事平均
              </p>
              <p className="text-3xl font-black text-slate-800">
                {linkAverage}{" "}
                <span className="text-base font-bold text-slate-400">個</span>
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-500 mb-1">
                最大リンク数 (1記事中)
              </p>
              <p className="text-3xl font-black text-slate-800">
                {data.ranking.quoting[0].cnt.toLocaleString()}{" "}
                <span className="text-base font-bold text-slate-400">件</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ランキングエリア (2カラム構成) */}
      <div id="ranking" className="pt-4">
        {/* 引用しているTOP50 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="text-2xl">🗣️</span> 最も多く「引用している」記事
          </h3>
          {/* スクロール可能なリスト */}
          <ul className="space-y-2 overflow-y-auto max-h-[500px] pr-2 pb-2">
            {data.ranking.quoting.map((q, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-indigo-50/70 rounded-xl border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* ランキングのバッジ（1〜3位は色を変える） */}
                  <span
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border 
                    ${
                      i === 0
                        ? "bg-amber-100 text-amber-600 border-amber-300"
                        : i === 1
                          ? "bg-slate-200 text-slate-600 border-slate-300"
                          : i === 2
                            ? "bg-orange-100 text-orange-600 border-orange-300"
                            : "bg-white text-slate-400 border-slate-200 group-hover:text-indigo-600 group-hover:border-indigo-200"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-bold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
                    {q.name}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-500 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 shrink-0 ml-2">
                  {q.cnt.toLocaleString()} 件
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 引用されているTOP50 */}
        <div className="mt-10 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="text-2xl">✨</span> 最も多く「引用されている」記事
          </h3>
          <ul className="space-y-2 overflow-y-auto max-h-[500px] pr-2 pb-2">
            {data.ranking.quoted.map((q, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-cyan-50/70 rounded-xl border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border 
                    ${
                      i === 0
                        ? "bg-amber-100 text-amber-600 border-amber-300"
                        : i === 1
                          ? "bg-slate-200 text-slate-600 border-slate-300"
                          : i === 2
                            ? "bg-orange-100 text-orange-600 border-orange-300"
                            : "bg-white text-slate-400 border-slate-200 group-hover:text-cyan-600 group-hover:border-cyan-200"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-bold text-slate-700 truncate group-hover:text-cyan-700 transition-colors">
                    {q.name}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-500 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 shrink-0 ml-2">
                  {q.cnt.toLocaleString()} 件
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
