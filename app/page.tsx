"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import InputForm from "@/components/input";
import ColumnPage from "@/components/column";

type InputData = {
  start: string;
  goal: string;
};

type Path = {
  name: string;
  displayName: string;
};

type PathResponse = {
  path: string[];
  error: string;
};

export default function Home() {
  const [path, setPath] = useState<Path[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isColumn, setIsColumn] = useState<boolean>(false);
  const methods = useForm({
    defaultValues: { start: "", goal: "" },
  });

  const ERROR_MESSAGES: Record<string, string> = {
    "Node not found": "入力されたノードが存在しません",
    "Goal node is Orphan": "このゴールノードには絶対にたどり着けません",
    "path not exist": "最短経路が長くなりすぎるため強制終了しました",
    "Could not connect to the server": "サーバー側に接続できませんでした",
  };

  const onSubmit = async (data: InputData) => {
    const start = data.start;
    const goal = data.goal;
    try {
      const resJson = await fetch(
        `api/finder?start=${encodeURIComponent(start)}&goal=${encodeURIComponent(goal)}`,
      );
      const res: PathResponse = await resJson.json();
      setIsLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        setPath(res.path.map((r) => ({ name: r, displayName: "" })));
        if (error) setError("");
      }
    } catch (e) {
      console.error(e);
      setError("Could not connect to the server");
    }
  };

  useEffect(() => {
    if (path.length === 0) return;
    if (error) return;

    const needsFetch = path.some((item, i) => i > 0 && item.displayName === "");
    if (!needsFetch) return;

    let cancelled = false;

    const getDisplayPath = async () => {
      const updated: Path[] = [...path];

      for (let i = 1; i < updated.length; i++) {
        if (updated[i].displayName !== "") continue;

        try {
          const res = await fetch(
            `/api/get_display_name?node=${encodeURIComponent(updated[i].name)}&foreNode=${encodeURIComponent(updated[i - 1].name)}`,
          );
          if (!res.ok) {
            console.error(`fetch failed: ${res.status}`);
            updated[i] = { ...updated[i], displayName: updated[i].name };
            continue;
          }
          const data = await res.json();
          updated[i] = {
            ...updated[i],
            displayName: data.text ? data.text : updated[i].name,
          };
        } catch (e) {
          console.error(e);
          updated[i] = { ...updated[i], displayName: updated[i].name };
        }
      }

      if (!cancelled) {
        setPath(updated);
      }
    };

    getDisplayPath();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-800 font-sans relative overflow-hidden selection:bg-indigo-200">
      {/* --- おしゃれポイント1: アンビエント背景（ふわっと光る装飾） --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-300/20 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-300/20 blur-[120px]"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:py-16 relative z-10">
        {/* ヘッダー */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 drop-shadow-sm pb-1">
            Wiki-Path-Finder
          </h1>
          <label className="cursor-pointer group inline-flex items-center justify-center px-6 py-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-full text-sm font-bold text-slate-600 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:bg-white hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:text-indigo-600 transition-all active:scale-95">
            {isColumn ? "✕ コラムを閉じる" : "✨ おまけコラム"}
            <input
              type="checkbox"
              className="hidden"
              checked={isColumn ?? false}
              onChange={() => setIsColumn((prev) => !prev)}
            />
          </label>
        </header>

        {!isColumn ? (
          <main className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* 説明エリア: すりガラス風カード */}
            <div
              id="description"
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mb-10 space-y-4"
            >
              <p className="text-slate-700 font-bold text-lg">
                バキ童チャンネル発{" "}
                <span className="text-indigo-600">「Wikipediaゴルフ」</span>{" "}
                の最短経路探索ツール⛳️
              </p>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                スタートとゴールの記事名を入力すると、Wikipediaの膨大なリンクの網目から最短ルートを導き出します。
                <br className="hidden sm:block" />
                思いもよらない記事同士の繋がりをお楽しみください。
              </p>
              <div className="flex gap-4 mt-6 pt-5 border-t border-slate-200/60">
                <span className="text-xs font-medium text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-full">
                  🇯🇵 日本語版Wikipedia対象
                </span>
                <span className="text-xs font-medium text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-full">
                  ※ DB一部削減あり
                </span>
              </div>
            </div>

            {/* 入力フォームエリア */}
            <div
              id="inputForm"
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white p-6 sm:p-10 mb-10 relative z-20"
            >
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* スタート入力 */}
                  <div className="space-y-3 relative z-30">
                    <label className="text-sm font-extrabold text-slate-700 flex items-center gap-2 ml-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                      START
                    </label>
                    <InputForm SG="start" />
                  </div>

                  {/* 装飾: つなぎ目のラインとアイコン */}
                  <div className="flex justify-center -my-5 relative z-10 pointer-events-none">
                    <div className="w-[2px] h-12 bg-gradient-to-b from-emerald-200 to-rose-200 absolute top-1/2 -translate-y-1/2"></div>
                    <div className="bg-white p-2.5 rounded-full shadow-md border border-slate-100 text-slate-300 relative z-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14" />
                        <path d="m19 12-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* ゴール入力 */}
                  <div className="space-y-3 relative z-20">
                    <label className="text-sm font-extrabold text-slate-700 flex items-center gap-2 ml-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]"></div>
                      GOAL
                    </label>
                    <InputForm SG="goal" />
                  </div>

                  {/* ボタン */}
                  <button
                    type="submit"
                    onClick={() => setIsLoading(true)}
                    className="w-full mt-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.3)] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 flex justify-center items-center gap-3 group"
                  >
                    <span>経路を探索する</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </form>
              </FormProvider>
            </div>

            {/* ローディング */}
            <div id="Loading" className="h-8">
              {isLoading && (
                <div className="flex justify-center items-center gap-3 animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                  <p className="text-indigo-600 font-bold text-sm tracking-widest">
                    SEARCHING...
                  </p>
                </div>
              )}
            </div>

            {/* 結果表示エリア */}
            <div id="result" className="mt-6">
              {error ? (
                <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-100 text-rose-600 px-6 py-5 rounded-2xl text-center font-bold shadow-sm">
                  {ERROR_MESSAGES[error] ?? "予期せぬエラーが発生しました"}
                </div>
              ) : (
                path.length !== 0 && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white p-6 sm:p-10 animate-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                      <p className="text-slate-400 font-bold text-sm tracking-widest mb-1">
                        RESULT
                      </p>
                      <h2 className="text-3xl font-black text-slate-800">
                        <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-cyan-400 pr-1">
                          {path.length - 1}
                        </span>{" "}
                        打で到達
                      </h2>
                    </div>

                    {/* おしゃれポイント2: 美しいタイムライン */}
                    <div className="relative pl-2 sm:pl-4">
                      {/* 美しいグラデーションの接続線 */}
                      <div className="absolute left-[27px] sm:left-[35px] top-6 bottom-6 w-[3px] bg-gradient-to-b from-emerald-300 via-indigo-300 to-rose-300 rounded-full opacity-60 z-0"></div>

                      {path.map((p, i) => (
                        <div
                          key={i}
                          className="relative z-10 flex items-center gap-5 sm:gap-6 group mb-6 last:mb-0"
                        >
                          {/* ステップのノード（丸） */}
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center font-black text-sm sm:text-base shadow-md transition-all duration-300 border-4 border-white
                            ${
                              i === 0
                                ? "bg-emerald-400 text-white shadow-emerald-400/30"
                                : i === path.length - 1
                                  ? "bg-rose-400 text-white shadow-rose-400/30"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                            }`}
                          >
                            {i + 1}
                          </div>

                          {/* 記事カード */}
                          <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm group-hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] group-hover:-translate-y-0.5 transition-all duration-300">
                            <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                              {p.name}
                            </span>
                            {p.displayName && (
                              <span className="block sm:inline sm:ml-3 text-sm text-slate-400 font-medium mt-1 sm:mt-0">
                                ({p.displayName})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </main>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <ColumnPage />
          </div>
        )}
      </div>
    </div>
  );
}
