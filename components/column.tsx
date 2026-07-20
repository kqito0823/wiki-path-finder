"use client";
import data from "@/content/data.json";
import pruned_prompt from "@/content/pruned_plot.json";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";

type plotData = {
  freq: number;
  quote: number;
};

export default function ColumnPage() {
  const orphanAverage =
    Math.round(
      (data.length.nodes.orphan / data.length.nodes.available) * 1000,
    ) / 10;

  const linkAverage = Math.round(
    data.length.edges.total / data.length.nodes.total,
  );

  const plotData = Object.values(pruned_prompt.data);
  const trial = pruned_prompt.trial.total.toLocaleString();

  const totalSeconds = Math.floor(pruned_prompt.trial.timer);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timeAverage =
    Math.round((totalSeconds / pruned_prompt.trial.total) * 1000) / 1000;

  const linearRegression = (plotData: plotData[]) => {
    const n = plotData.length;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const p of plotData) {
      const x = Math.log10(p.freq);
      const y = Math.log10(p.quote);

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    // 傾きと切片を求める
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  const { slope, intercept } = linearRegression(plotData);
  const xs = plotData.map((d) => d.freq);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  const logMinX = Math.log10(minX);
  const logMaxX = Math.log10(maxX);

  const logMinY = slope * logMinX + intercept;
  const logMaxY = slope * logMaxX + intercept;

  const line = [
    {
      freq: minX,
      quote: Math.pow(10, logMinY),
    },
    {
      freq: maxX,
      quote: Math.pow(10, logMaxY),
    },
  ];

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
        className="space-y-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)] sm:p-8"
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

              <dd className="text-right">
                <span
                  className="block text-2xl font-bold leading-none"
                  style={{ fontFamily: "'Caveat',cursive" }}
                >
                  {data.length.nodes.available.toLocaleString()}
                  <span
                    className="ml-1 text-xs font-normal text-[#7C6A3F]"
                    style={{ fontFamily: "'Oswald',sans-serif" }}
                  >
                    件
                  </span>
                </span>
                <span className="text-[11px] text-[#A99B6E]">
                  ウェブ実装版は厳選した{data.length.web_nodes.toLocaleString()}
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
              <dt className="text-sm font-medium text-[#1F3A2E]">
                全リンク合計
              </dt>
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
              <dt className="text-sm font-medium text-[#1F3A2E]">
                一記事平均リンク個数
              </dt>
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
        <div className="rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]">
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            最も多く「引用している」記事Top100
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
        <div className="mt-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]">
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            最も多く「引用されている」記事Top100
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
                  {q.cnt.toLocaleString()} 回
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]">
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            最も多く「引用し」「引用されている」記事Top100
          </h3>
          <ul className="max-h-150 space-y-1 overflow-y-scroll pr-1">
            {data.ranking.social.map((q, i) => (
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

      <div
        id="correlation"
        className="mt-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 mb-8 space-y-3 text-center sm:text-left shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]"
      >
        <h3 className="text-[#9DBBA4]">
          最短経路を{trial}回調べて分かったこと
        </h3>
        <p className="text-base leading-relaxed text-[#7C6A3F]">
          ランダムな記事<strong>{trial}件の最短経路</strong>
          を求めました
        </p>
        <p className="text-base leading-relaxed text-[#7C6A3F]">
          (パソコン君には頑張ってもらいました)
        </p>
      </div>

      <div
        id="correlation-data"
        className="space-y-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)] sm:p-8"
      >
        <div>
          <h3
            className="mb-4 text-xs font-bold tracking-[0.2em] text-[#7C6A3F]"
            style={{ fontFamily: "'Oswald',sans-serif" }}
          >
            実験について
          </h3>
          <dl className="divide-y divide-dashed divide-[#D8CBA0]">
            <div className="flex items-center justify-between py-3">
              <dt>
                <span className="block text-sm font-medium text-[#1F3A2E]">
                  有効試行回数
                </span>
                <span className="block text-[11px] text-[#A99B6E]">
                  ※総試行回数 - 7回以上
                </span>
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {(
                  pruned_prompt.trial.total - pruned_prompt.trial.over_7
                ).toLocaleString()}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  回
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">総試行回数</dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {trial}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  回
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">
                最短経路が7回以上のためエラーになった回数
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {pruned_prompt.trial.over_7.toLocaleString()}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  回
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
            {trial}回試行してわかったこと
          </h3>
          <dl className="divide-y divide-dashed divide-[#D8CBA0]">
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">
                最短経路に登場した記事種類
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {pruned_prompt.quote.quote_data_length}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  種
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-[#1F3A2E]">
                最短経路の平均
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {(pruned_prompt.quote.average + 1).toLocaleString()}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  打
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt>
                <span className="block text-sm font-medium text-[#1F3A2E]">
                  「6次の隔たり」を応用した最短経路の平均打数予測
                </span>
                <span className="flex items-end gap-1 text-[11px] text-[#A99B6E]">
                  <span className="font-medium">※log</span>
                  <sub className="text-[8px] leading-none">平均リンク数</sub>
                  総記事数
                </span>
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {pruned_prompt.quote.six_degrees}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  打
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt>
                <span className="block text-sm font-medium text-[#1F3A2E]">
                  {trial}回実行するのにかかった時間
                </span>
                <span className="block text-[11px] text-[#A99B6E]">
                  ※最短経路の計算に用いた時間のみ
                </span>
              </dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {hours}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  時間
                </span>
                {minutes}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  分
                </span>
                {seconds}
                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  秒
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between py-3">
              <dt>最短経路計算時間平均</dt>
              <dd
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Caveat',cursive" }}
              >
                {timeAverage}

                <span
                  className="ml-1 text-xs font-normal text-[#7C6A3F]"
                  style={{ fontFamily: "'Oswald',sans-serif" }}
                >
                  秒
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div
        id="graph"
        className="mt-6 rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 mb-8 space-y-3 text-center sm:text-left shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]"
      >
        <h3 className="text-[#9DBBA4] text-xl">
          最短経路出現回数と横のつながり(引用し引用される回数)の相関
        </h3>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
            margin={{
              top: 5,
              right: 5,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="freq"
              name="最短経路出現回数"
              scale="log"
              domain={["auto", "auto"]}
              label={{
                value: "最短経路での出現回数",
                position: "insideBottom",
                offset: -10,
              }}
            />

            <YAxis
              type="number"
              dataKey="quote"
              name="横のつながり数"
              scale="log"
              domain={["auto", "auto"]}
              label={{
                value: "横のつながりの数",
                position: "insideLeft",
                offset: -10,
                angle: -90,
              }}
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={plotData} />
            <Line data={line} dataKey="quote" dot={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
