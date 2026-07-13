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
    <div>
      <input
        type="text"
        {...rhfField}
        value={inputValue}
        onChange={(e) => handleChange(e, SG)}
        placeholder="記事名を入力"
        autoComplete="off"
      />
      {searchResult.length > 0 && (
        <ul>
          {searchResult.map((sr, i) => (
            <li
              key={i}
              onClick={() => {
                handleConfirm(sr.node_id, sr.name, sr.is_redirect);
              }}
            >
              <p>
                {sr.name}
                {sr.is_redirect && "リダイレクト"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
