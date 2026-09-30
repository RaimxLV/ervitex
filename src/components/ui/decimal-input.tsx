import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type Props = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  onValueChange: (v: number | null) => void;
};

const parse = (s: string) => {
  const t = s.replace(/\s/g, "").replace(",", ".");
  if (t === "" || t === ".") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** Text input that accepts "12,50" or "12.50" while typing. */
export const DecimalInput = ({ value, onValueChange, onBlur, ...rest }: Props) => {
  const [text, setText] = useState(value == null ? "" : String(value).replace(".", ","));
  useEffect(() => {
    if (parse(text) !== (value ?? null)) setText(value == null ? "" : String(value).replace(".", ","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <Input
      {...rest}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        if (!/^\d*[.,]?\d{0,2}$/.test(v.replace(/\s/g, ""))) return;
        setText(v);
        onValueChange(parse(v));
      }}
      onBlur={onBlur}
    />
  );
};
