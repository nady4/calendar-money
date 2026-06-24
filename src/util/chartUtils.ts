import { Temporal } from "@js-temporal/polyfill";

const COLOUR_POSITIVE = "rgb(34, 197, 94)";
const COLOUR_NEGATIVE = "rgb(239, 68, 68)";
const COLOUR_BALANCE = "rgb(91, 140, 255)";

const toRgba = (color: string, alpha: number): string => {
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/, `${alpha})`);
  }
  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(91, 140, 255, ${alpha})`;
};

const formatTickCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  }
  return `${sign}$${abs.toFixed(0)}`;
};

const tooltipAmount = (value: number): string => {
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${value < 0 ? "-" : ""}$${formatted}`;
};

const formatDateLabel = (
  date: Temporal.PlainDate,
  opts: "short" | "month" = "short"
): string => {
  const day = String(date.day).padStart(2, "0");
  const month = String(date.month).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  return opts === "month"
    ? `${monthNames[date.month - 1]} ${date.year}`
    : `${day}/${month}/${date.year}`;
};

const baseChartTheme = {
  font: {
    family: "Nunito Sans, sans-serif"
  },
  text: "#f4f6fb",
  grid: "rgba(156, 163, 175, 0.12)",
  tooltipBg: "rgba(10, 11, 16, 0.95)",
  tooltipBorder: "#2e3344"
};

export {
  COLOUR_POSITIVE,
  COLOUR_NEGATIVE,
  COLOUR_BALANCE,
  toRgba,
  formatTickCurrency,
  tooltipAmount,
  formatDateLabel,
  baseChartTheme
};