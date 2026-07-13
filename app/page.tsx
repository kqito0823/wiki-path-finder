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
    <>
      <header>
        <h1>Wiki-Path-Finder</h1>
        <label>
          おまけコラムを見る
          <input
            type="checkbox"
            checked={isColumn ?? false}
            onChange={() => {
              setIsColumn((prev) => !prev);
            }}
          />
        </label>
      </header>
      {!isColumn ? (
        <main>
          <div id="description">
            <p>
              このサイトは、バキ童氏のYouTubeチャンネルにて行われていた企画「Wikipediaゴルフ」の最短経路を出してくれます。
            </p>
            <p>
              スタート記事とゴール記事を入力すると、Wikipedia内のリンク構造を探索し、最短経路を表示します。
            </p>
            <p>
              Wikipediaゴルフの攻略や、記事同士の意外なつながりを見つけるのにご活用ください。
            </p>
            <p>※検索対象は日本語版Wikipediaです。</p>
            <p>※DBを無料枠に収めるために、ある程度削減しています。</p>
          </div>
          <div id="inputForm">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <p>スタート</p>
                <InputForm SG="start" />
                <p>ゴール</p>
                <InputForm SG="goal" />
                <button type="submit" onClick={() => setIsLoading(true)}>
                  経路を探す
                </button>
              </form>
            </FormProvider>
          </div>
          <div id="Loading">{isLoading && <p>検索中...</p>}</div>
          <div id="result">
            {error ? (
              <p>{ERROR_MESSAGES[error] ?? "予期せぬエラーが発生しました"}</p>
            ) : (
              path.length !== 0 && (
                <div>
                  {path.map((p, i) => (
                    <div key={i}>
                      <span>{p.name}</span>
                      {p.displayName && <span>{p.displayName}</span>}
                    </div>
                  ))}
                  <span>{path.length - 1}打で到達</span>
                </div>
              )
            )}
          </div>
        </main>
      ) : (
        <ColumnPage />
      )}
    </>
  );
}
