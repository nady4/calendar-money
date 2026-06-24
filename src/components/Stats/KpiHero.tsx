import { Temporal } from "@js-temporal/polyfill";
import { TransactionType, TotalType } from "../../types";
import {
  getMonthTotals,
  getYearTotals,
  formatCurrency
} from "../../util/functions";
import { months } from "../../util/constants";

interface KpiHeroProps {
  transactions: TransactionType[];
  selectedDay: Temporal.PlainDate;
  scope: "month" | "year";
}

const KpiHero = ({ transactions, selectedDay, scope }: KpiHeroProps) => {
  let current: TotalType;
  let previous: TotalType;
  let label: string;

  if (scope === "month") {
    current = getMonthTotals(
      transactions,
      months[selectedDay.month - 1],
      selectedDay.year
    );
    const prevDate = selectedDay.subtract({ months: 1 });
    previous = getMonthTotals(
      transactions,
      months[prevDate.month - 1],
      prevDate.year
    );
    label = `${months[selectedDay.month - 1]} ${selectedDay.year}`;
  } else {
    current = getYearTotals(transactions, selectedDay.year);
    previous = getYearTotals(transactions, selectedDay.year - 1);
    label = `${selectedDay.year}`;
  }

  const savingsRate =
    current.income > 0
      ? ((current.balance / current.income) * 100).toFixed(1)
      : "0.0";

  const delta = (cur: number, prev: number) => {
    if (prev === 0) return cur === 0 ? 0 : 100;
    return ((cur - prev) / Math.abs(prev)) * 100;
  };

  const DeltaPill = ({ value }: { value: number }) => {
    const up = value >= 0;
    return (
      <span className={`kpi-delta ${up ? "up" : "down"}`}>
        {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="kpi-hero card">
      <div className="kpi-period">
        <h2 className="kpi-period-label">{label}</h2>
        <span className="kpi-period-scope">
          {scope === "month" ? "Monthly" : "Yearly"} overview
        </span>
      </div>
      <div className="kpi-grid">
        <div className="kpi-tile kpi-balance">
          <span className="kpi-label">Net Balance</span>
          <span
            className={`kpi-value ${current.balance >= 0 ? "positive" : "negative"}`}
          >
            {current.balance >= 0 ? "+" : "-"}$
            {formatCurrency(Math.abs(current.balance))}
          </span>
          <DeltaPill value={delta(current.balance, previous.balance)} />
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Income</span>
          <span className="kpi-value positive">
            +${formatCurrency(current.income)}
          </span>
          <DeltaPill value={delta(current.income, previous.income)} />
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Expenses</span>
          <span className="kpi-value negative">
            -${formatCurrency(current.expenses)}
          </span>
          <DeltaPill value={delta(current.expenses, previous.expenses)} />
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Savings Rate</span>
          <span className="kpi-value">{savingsRate}%</span>
          <span className="kpi-sub">of income kept</span>
        </div>
      </div>
    </div>
  );
};

export default KpiHero;