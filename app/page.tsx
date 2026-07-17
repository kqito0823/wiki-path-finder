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
            updated[i] = { ...updated[i], displayName: updated[i].name };
            continue;
          }
          const data = await res.json();
          updated[i] = {
            ...updated[i],
            displayName: data.text ? data.text : updated[i].name,
          };
        } catch (e) {
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
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Caveat:wght@600;700&display=swap');`}</style>

      <div
        className="relative min-h-screen  text-[#EDE8D6]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(126,169,138,0.10) 0px, rgba(126,169,138,0.10) 48px, transparent 48px, transparent 96px)",
        }}
      >
        {/* スタジアムの灯りのような、控えめな上部の光暈 */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(126,169,138,0.16),transparent)]" />

        <header className="sticky top-0 z-30 border-b border-[#3A5142]/60 bg-[#16241C]/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <h1
              className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#F3EEDD] sm:text-2xl"
              style={{ fontFamily: "'Oswald',sans-serif" }}
            >
              <span aria-hidden className="text-[#E1B84B]">
                ⛳
              </span>
              Wiki-Path-Finder
            </h1>

            <label className="group flex cursor-pointer items-center gap-2 rounded-full border border-[#3A5142] bg-[#1E3328] px-4 py-1.5 text-xs text-[#CFE3D4] transition hover:border-[#E1B84B]/60 hover:text-[#F3EEDD] sm:text-sm">
              {isColumn ? "コラムを閉じる" : "おまけコラム"}
              <input
                type="checkbox"
                className="hidden"
                checked={isColumn ?? false}
                onChange={() => setIsColumn((prev) => !prev)}
              />
              <span
                aria-hidden
                className="text-xs text-[#E1B84B] transition group-hover:translate-x-0.5"
              >
                →
              </span>
            </label>
          </div>
        </header>

        {!isColumn ? (
          <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:pt-16">
            {/* リード文 */}
            <section className="rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:p-8 mb-8 space-y-3 text-center sm:text-left">
              <p className="text-sm text-[#9DBBA4]">
                バキ童チャンネル発「Wikipediaゴルフ」の最短経路探索ツール
              </p>
              <p className="text-base leading-relaxed text-[#7C6A3F] sm:text-lg">
                スタートとゴールの記事名を入力すると、Wikipediaの膨大なリンクの網目から最短ルートを導き出します。
              </p>
              <p className="text-base leading-relaxed text-[#7C6A3F]">
                思いもよらない記事同士の繋がりをお楽しみください。
              </p>

              <div className="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3A5142] bg-[#1E3328] px-3 py-1 text-xs text-[#CFE3D4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7FA98A]" />
                  日本語版Wikipedia対象
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5C4A2A] bg-[#2A2418] px-3 py-1 text-xs text-[#E1B84B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E1B84B]" />※
                  DB一部削減あり
                </span>
              </div>
            </section>

            {/* スコアカード:入力フォーム */}
            <div
              id="inputForm"
              className="rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:p-8"
            >
              <p
                className="mb-6 text-xs font-semibold tracking-[0.2em] text-[#7C6A3F]"
                style={{ fontFamily: "'Oswald',sans-serif" }}
              >
                SCORECARD
              </p>

              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                  <div className="relative">
                    {/* ホール間を結ぶ点線フェアウェイ */}
                    <span
                      aria-hidden
                      className="absolute left-4 top-10 bottom-10 w-px border-l-2 border-dashed border-[#B9AE86]"
                    />

                    <div className="space-y-5">
                      <label className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1F3A2E] bg-[#F3EEDD] text-[10px] font-bold">
                          S
                        </span>
                        <span className="flex-1">
                          <span
                            className="mb-1 block text-xs font-bold tracking-[0.15em] text-[#7C6A3F]"
                            style={{ fontFamily: "'Oswald',sans-serif" }}
                          >
                            START
                          </span>
                          <InputForm SG="start" />
                        </span>
                      </label>

                      <label className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#C0392B] bg-[#F3EEDD] text-[13px] z-10">
                          🚩
                        </span>
                        <span className="flex-1">
                          <span
                            className="mb-1 block text-xs font-bold tracking-[0.15em] text-[#7C6A3F]"
                            style={{ fontFamily: "'Oswald',sans-serif" }}
                          >
                            GOAL
                          </span>
                          <InputForm SG="goal" />
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    onClick={() => setIsLoading(true)}
                    className="mt-7 w-full rounded-xl bg-[#1F3A2E] py-3.5 text-sm font-bold tracking-wide text-[#F3EEDD] transition hover:bg-[#16241C] active:scale-[0.99] disabled:opacity-60"
                  >
                    経路を探索する ⛳
                  </button>
                </form>
              </FormProvider>
            </div>

            {/* ローディング */}
            <div id="Loading" className="mt-6 flex justify-center">
              {isLoading && (
                <p className="flex items-center gap-2 text-sm text-[#E1B84B]">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#E1B84B] [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#E1B84B]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#E1B84B] [animation-delay:0.2s]" />
                  </span>
                  SEARCHING...
                </p>
              )}
            </div>

            {/* 結果 */}
            <div id="result" className="mt-6">
              {error ? (
                <p className="rounded-xl border border-[#7A3B2E] bg-[#2A1B16] px-5 py-4 text-sm text-[#E8A98E]">
                  {ERROR_MESSAGES[error] ?? "予期せぬエラーが発生しました"}
                </p>
              ) : (
                path.length !== 0 && (
                  <div className="rounded-2xl border border-[#3A5142] bg-[#F3EEDD] p-6 text-[#1F3A2E] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:p-8">
                    <div className="mb-6 flex items-baseline gap-3">
                      <span
                        className="text-5xl font-bold leading-none text-[#C0392B]"
                        style={{ fontFamily: "'Caveat',cursive" }}
                      >
                        {path.length - 1}
                      </span>
                      <h2
                        className="text-sm font-bold tracking-[0.15em] text-[#1F3A2E]"
                        style={{ fontFamily: "'Oswald',sans-serif" }}
                      >
                        打で到達
                      </h2>
                    </div>

                    <ol className="relative pl-10">
                      <span
                        aria-hidden
                        className="absolute left-4 top-4 bottom-4 w-px border-l-2 border-dashed border-[#B9AE86]"
                      />
                      {path.map((p, i) => {
                        const isLast = i === path.length - 1;
                        return (
                          <li key={i} className="relative pb-6 last:pb-0">
                            <span
                              className={`absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                                isLast
                                  ? "border-[#C0392B] bg-[#C0392B] text-[#F3EEDD]"
                                  : "border-[#1F3A2E] bg-[#F3EEDD] text-[#1F3A2E]"
                              }`}
                            >
                              {isLast ? "🚩" : i + 1}
                            </span>
                            <p className="pt-1 text-sm font-medium leading-snug text-[#1F3A2E]">
                              {p.name}
                              {p.displayName && (
                                <span className="ml-2 rounded-full bg-[#E7DFC2] px-2 py-0.5 text-[11px] font-normal text-[#7C6A3F]">
                                  {p.displayName}
                                </span>
                              )}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )
              )}
            </div>
          </main>
        ) : (
          <ColumnPage />
        )}
      </div>
    </>
  );
}
