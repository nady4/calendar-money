import { useEffect, useState } from "react";

const STORAGE_KEY = "calendar-money:startOnMonday";

const readInitial = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const useStartOnMonday = (): [
  boolean,
  (value: boolean) => void
] => {
  const [startOnMonday, setStartOnMonday] = useState<boolean>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, startOnMonday ? "1" : "0");
    } catch {
      /* no-op */
    }
  }, [startOnMonday]);

  return [startOnMonday, setStartOnMonday];
};

export const SUNDAY_START: ReadonlyArray<string> = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
];

export const MONDAY_START: ReadonlyArray<string> = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

export const getWeekdayLabel = (
  startOnMonday: boolean,
  index: number
): string =>
  (startOnMonday ? MONDAY_START : SUNDAY_START)[index] ?? "";

export const getGridStartOffset = (
  dayOfWeek: number,
  startOnMonday: boolean
): number => {
  if (startOnMonday) {
    return dayOfWeek - 1;
  }
  return dayOfWeek === 7 ? 0 : dayOfWeek;
};
