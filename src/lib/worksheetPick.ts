/** Aktīvais preču saraksts, kuram katalogā izvēlas preces. */
export interface WorksheetPick {
  token: string;
  mode: "add" | "swap";
  rowId?: string | null;
  label?: string | null;
}

const KEY = "ervitex:worksheet-pick";

export const readWorksheetPick = (): WorksheetPick | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as WorksheetPick;
    return v?.token ? v : null;
  } catch {
    return null;
  }
};

export const startWorksheetPick = (v: WorksheetPick) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
    window.dispatchEvent(new Event("worksheet-pick"));
  } catch { /* ignore */ }
};

export const endWorksheetPick = () => {
  try {
    sessionStorage.removeItem(KEY);
    window.dispatchEvent(new Event("worksheet-pick"));
  } catch { /* ignore */ }
};

/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";

export const useWorksheetPick = () => {
  const [pick, setPick] = useState<WorksheetPick | null>(() => readWorksheetPick());
  useEffect(() => {
    const sync = () => setPick(readWorksheetPick());
    window.addEventListener("worksheet-pick", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("worksheet-pick", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return pick;
};
