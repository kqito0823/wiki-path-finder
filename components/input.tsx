import { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
type Result = {
  node_id: string;
  name: string;
  is_redirect: boolean;
  is_orphan: boolean;
};

export default function InputForm({ SG }: { SG: string }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchResult, setSearchResult] = useState<Result[]>([]);
  const { register, setValue, watch } = useFormContext();
  const inputValue = watch(SG) ?? "";
  const { onChange: rhfOnChange, ...rhfField } = register(SG);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, SG: string) => {
    rhfOnChange(e);
    const value = e.target.value;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (value == "") return setSearchResult([]);

    timerRef.current = setTimeout(async () => {
      const res = await fetch(
        `api/search_node?name=${encodeURIComponent(value)}&sg=${encodeURIComponent(SG)}`,
      );
      const data = await res.json();
      setSearchResult(data ?? []);
    }, 500);
  };

  const handleConfirm = async (
    id: string,
    name: string,
    is_redirect: boolean,
  ) => {
    let finalName = name;
    if (is_redirect) {
      const res = await fetch(
        `api/search_redirect?id=${encodeURIComponent(id)}`,
      );
      const data = await res.json();
      finalName = data.name;
    }
    setValue(SG, finalName, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setSearchResult([]);
  };
  return (
    <div className="relative w-full group">
      {/* 入力フィールド */}
      <input
        type="text"
        {...rhfField}
        value={inputValue}
        onChange={(e) => handleChange(e, SG)}
        placeholder="Wikipediaの記事名を入力..."
        autoComplete="off"
        className="w-full px-6 py-4 bg-white border-0 ring-1 ring-slate-200/80 rounded-2xl text-slate-800 text-lg font-bold placeholder:text-slate-300 placeholder:font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
      />

      {/* 検索サジェスト (絶対配置・フローティングメニュー風) */}
      {searchResult.length > 0 && (
        <ul className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-xl border border-slate-100/80 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-h-[280px] overflow-y-auto divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {searchResult.map((sr, i) => (
            <li
              key={i}
              onClick={() => {
                handleConfirm(sr.node_id, sr.name, sr.is_redirect);
              }}
              className="cursor-pointer px-6 py-4 hover:bg-indigo-50/50 transition-colors flex items-center justify-between"
            >
              <p className="text-slate-700 font-bold group-hover:text-indigo-700 truncate pr-4 transition-colors">
                {sr.name}
              </p>

              {/* リダイレクトのバッジ */}
              {sr.is_redirect && (
                <span className="shrink-0 text-[10px] font-black tracking-wider bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full border border-slate-200/60">
                  REDIRECT
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
