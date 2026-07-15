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
    <div className="relative">
      {/* 入力フィールド */}
      <div className="flex items-center gap-2 rounded-lg border border-[#B9AE86] bg-white/70 px-3.5 py-2.5 transition focus-within:border-[#1F3A2E] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1F3A2E]/15">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-[#7C6A3F]"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          {...rhfField}
          value={inputValue}
          onChange={(e) => handleChange(e, SG)}
          autoComplete="off"
          placeholder="記事名を入力..."
          className="w-full bg-transparent text-sm text-[#1F3A2E] placeholder:text-[#A99B6E] focus:outline-none"
        />
      </div>

      {/* 検索サジェスト (絶対配置・フローティングメニュー風) */}
      {searchResult.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-xl border border-[#B9AE86] bg-[#F3EEDD] py-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]">
          {searchResult.map((sr, i) => (
            <li
              key={i}
              onClick={() => {
                handleConfirm(sr.node_id, sr.name, sr.is_redirect);
              }}
              className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm text-[#1F3A2E] transition hover:bg-[#E7DFC2]"
            >
              <span className="truncate">{sr.name}</span>
              {sr.is_redirect && (
                <span className="-rotate-3 shrink-0 rounded-full border border-[#C9A84C] px-1.5 py-0.5 text-[10px] font-bold text-[#8A6E1E]">
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
