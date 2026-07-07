import { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { fileURLToPath } from "url";

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
      <input
        type="text"
        {...rhfField}
        value={inputValue}
        onChange={(e) => handleChange(e, SG)}
        placeholder="記事名を入力"
        autoComplete="off"
        className="w-full border-0 border-b-[1.5px] border-[#dad5c8] bg-transparent py-2 px-0.5 font-sans text-[15px] text-[#1f2430] outline-none placeholder:text-[#b8b4a8] focus:border-[#2454ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2454ff]"
      />
      {searchResult.length > 0 && (
        <ul className="absolute inset-x-0 z-10 mt-1.5 max-h-60 overflow-y-auto rounded border border-[#dad5c8] bg-white p-1.5 shadow-[0_8px_24px_rgba(31,36,48,0.1)]">
          {searchResult.map((sr, i) => (
            <li
              key={i}
              onClick={() => {
                handleConfirm(sr.node_id, sr.name, sr.is_redirect);
              }}
              className="cursor-pointer rounded px-2.5 py-2 transition hover:bg-[#e8edff]"
            >
              <p className="m-0 flex items-center gap-2 text-sm text-[#1f2430]">
                {sr.name}
                {sr.is_redirect && (
                  <span className="whitespace-nowrap rounded-sm bg-[#f6e9d9] px-1.5 py-0.5 text-[11px] tracking-wide text-[#c77d2e]">
                    リダイレクト
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
