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
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:pt-16">
      {/* 説明 */}
      <div
        id="description"
        className="rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 mb-8 space-y-3 text-center sm:text-left"
      >
        <h2 className="text-[#9DBBA4]">
          <span className="text-sm">おまけコラム・・・</span>記事とリンク
        </h2>
        <p className="text-base leading-relaxed text-[#7C6A3F]">
          今回開発をする中で、様々なウィキペディアのデータマイニング的なアプローチをしました。
        </p>
        <p className="text-base leading-relaxed text-[#7C6A3F]">
          ということで、ウィキペディアの「記事」と「リンク」の関係についていろいろまとめてみました！！
        </p>
      </div>

      {/* 統計スコアカード */}
      <div
        id="length"
        className="space-y-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:p-8"
      >
        <div>
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            記事の統計
          </h3>
          <dl className="divide-y divide-dashed divide-[#D8CBA0]">
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">総記事数</dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {data.length.nodes.available.toLocaleString()}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  件
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt>
                <span className="block text-sm font-medium text-[#1F3A2E]">
                  リダイレクト数
                </span>
                <span className="block text-[11px] text-[#A99B6E]">
                  ※記事名の表記揺れ
                </span>
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {data.length.nodes.redirect.toLocaleString()}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  件
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt>
                <span className="block text-sm font-medium text-[#1F3A2E]">
                  孤立記事
                </span>
                <span className="block text-[11px] text-[#A99B6E]">
                  ※他から引用されていない記事
                </span>
              </dt>
              <dd className="text-right">
                <span
                  className="block text-2xl font-bold leading-none"
                  style={{ fontFamily: "'Caveat',cursive" }}
                >
                  {data.length.nodes.orphan.toLocaleString()}
                  <span
                    className="ml-1 text-xs font-normal text-[#7C6A3F]"
                    style={{ fontFamily: "'Oswald',sans-serif" }}
                  >
                    件
                  </span>
                </span>
                <span className="text-[11px] text-[#A99B6E]">
                  全体 {orphanAverage}%
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-[#D8CBA0] pt-6">
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            リンクの統計
          </h3>
          <dl className="divide-y divide-dashed divide-[#D8CBA0]">
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">全記事合計</dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {data.length.edges.total.toLocaleString()}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  個
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">一記事平均</dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {linkAverage}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  個
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">
                最大リンク数
                <span className="ml-1 text-[11px] font-normal text-[#A99B6E]">
                  (1記事中)
                </span>
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {data.ranking.quoting[0].cnt.toLocaleString()}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  件
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* リーダーボード */}
      <div id="ranking" className="mt-6 ">
        <div className="rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            最も多く「引用している」記事
          </h3>
          <ul className="max-h-150 space-y-1 overflow-y-scroll pr-1">
            {data.ranking.quoting.map((q, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#E7DFC2]"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    i === 0
                      ? "bg-[#C9A84C] text-[#1F3A2E]"
                      : "border border-[#B9AE86] text-[#7C6A3F]"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm">{q.name}</span>
                <span className="shrink-0 text-sm font-bold text-[#7C6A3F]">
                  {q.cnt.toLocaleString()} 件
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            最も多く「引用されている」記事
          </h3>
          <ul className="max-h-150 space-y-1 overflow-y-scroll pr-1">
            {data.ranking.quoted.map((q, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#E7DFC2]"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    i === 0
                      ? "bg-[#C9A84C] text-[#1F3A2E]"
                      : "border border-[#B9AE86] text-[#7C6A3F]"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm">{q.name}</span>
                <span className="shrink-0 text-sm font-bold text-[#7C6A3F]">
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
