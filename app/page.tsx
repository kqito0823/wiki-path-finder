"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import InputForm from "@/components/input";

type InputData = {
  start: string;
  goal: string;
};

export default function Home() {
  const [path, setPath] = useState<string[]>([]);
  const methods = useForm({
    defaultValues: { start: "", goal: "" },
  });

  const onSubmit = async (data: InputData) => {
    const start = data.start;
    const goal = data.goal;
    console.log(start, goal);
    const res = await fetch(
      `api/finder?start=${encodeURIComponent(start)}&goal=${encodeURIComponent(goal)}`,
    );
    const path = await res.json();
    console.log(path);
    setPath(path.path);
  };

  useEffect(async () => {}, []);

  return (
    <>
      <div className="h-dvh flex justify-center bg-[#eef1e4] bg-[repeating-linear-gradient(135deg,#eef1e4_0px,#eef1e4_28px,#e4e9d9_28px,#e4e9d9_56px)] px-5 py-12 text-[#1f2430]">
        <div className="flex flex-col gap-20">
          <div className="w-full max-w-120 overflow-hidden rounded-2xl border border-[#d9d2b8] bg-[#fbf8f0] shadow-[0_8px_24px_rgba(31,36,48,0.10)]">
            {/* ヘッダー：スコアカードのタイトル帯 */}
            <div className="bg-[#1f4d36] px-9 pb-5 pt-6">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.28em] text-[#9fc6ab]">
                ROUTE FINDER
              </p>
              <h1 className="text-2xl font-bold text-white">経路を探す</h1>
            </div>

            <div className="px-9 pb-8 pt-7">
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit(onSubmit)}
                  className="flex flex-col gap-7"
                >
                  <div className="relative flex items-start gap-6 pt-2.75">
                    {/* フェアウェイのトレイル（水平） */}
                    <svg
                      className="  pointer-events-none absolute inset-x-0 top-[11px] h-px w-full"
                      aria-hidden="true"
                    >
                      <line
                        x1="0"
                        y1="0.5"
                        x2="100%"
                        y2="0.5"
                        stroke="#c9c2a6"
                        strokeWidth="2"
                        strokeDasharray="3 7"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* スタート：ティーマーカー */}
                    <div className="mt-5 relative min-w-0 flex-1">
                      <div className="mb-3 flex flex-col items-center gap-2 text-center">
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#1f4d36] bg-[#fbf8f0] text-[#1f4d36]">
                          <svg
                            viewBox="0 0 24 24"
                            width="10"
                            height="10"
                            fill="currentColor"
                          >
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                        </span>
                        <p className="text-[13px] tracking-[0.12em] text-[#8a8672]">
                          スタート
                        </p>
                      </div>
                      <InputForm SG="start" />
                    </div>

                    {/* ゴール：フラッグ */}
                    <div className="mt-5 relative min-w-0 flex-1">
                      <div className="mb-3 flex flex-col items-center gap-2 text-center">
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#c0392b] bg-[#fbf8f0] text-[#c0392b]">
                          <svg
                            viewBox="0 0 24 24"
                            width="13"
                            height="13"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          >
                            <path d="M4 2v20M4 3h15l-3.2 4L19 11H4" />
                          </svg>
                        </span>
                        <p className="text-[13px] tracking-[0.12em] text-[#8a8672]">
                          ゴール
                        </p>
                      </div>
                      <InputForm SG="goal" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="ml-[30px] inline-flex w-fit items-center gap-2 rounded-full bg-[#1f2430] px-6.5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#1f4d36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f4d36]"
                  >
                    経路を探す
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </form>
              </FormProvider>
            </div>
          </div>

          {/* 結果：スコアカード風の丸囲みスコア */}
          {path.length !== 0 && (
            <div className="mx-auto mt-6 w-full rounded-2xl border border-[#d9d2b8] bg-[#fbf8f0] px-7 py-6 shadow-[0_8px_24px_rgba(31,36,48,0.10)]">
              <p className="mb-4 text-[11px] font-semibold tracking-[0.28em] text-[#8a8672]">
                RESULT
              </p>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                {path.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i !== 0 && <span className="text-[#c9c2a6]">···</span>}
                    <span className="rounded-full border border-[#d9d2b8] bg-white px-3.5 py-1.5 text-sm font-medium text-[#1f2430]">
                      {p}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-dashed border-[#d9d2b8] pt-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#1f4d36] text-lg font-bold text-[#1f4d36]">
                  {path.length - 1}
                </span>
                <span className="text-sm text-[#6b7280]">打で到達</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
