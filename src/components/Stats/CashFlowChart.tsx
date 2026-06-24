import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Temporal } from "@js-temporal/polyfill";
import {
  TransactionType,
  TotalType
} from "../../types";
import { getDailyMonthTotals, getMonthTotal } from "../../util/functions";
import {
  COLOUR_POSITIVE,
  COLOUR_NEGATIVE,
  COLOUR_BALANCE,
  toRgba,
  formatTickCurrency,
  tooltipAmount,
  baseChartTheme
} from "../../util/chartUtils";
import { months } from "../../util/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CashFlowChartProps {
  transactions: TransactionType[];
  selectedDay: Temporal.PlainDate;
  scope: "month" | "year";
}

const CashFlowChart = ({
  transactions,
  selectedDay,
  scope
}: CashFlowChartProps) => {
  const [mode, setMode] = useState<"cumulative" | "perPoint">("cumulative");

  const labels: string[] = [];
  let incomeSeries: number[] = [];
  let expensesSeries: number[] = [];
  let balanceSeries: number[] = [];
  let xTitle = "";

  if (scope === "month") {
    const daysInMonth = Temporal.PlainYearMonth.from({
      year: selectedDay.year,
      month: selectedDay.month
    }).daysInMonth;
    for (let i = 1; i <= daysInMonth; i++) labels.push(`${i}`);
    xTitle = "Day";

    const cumulative = getDailyMonthTotals(
      transactions,
      months[selectedDay.month - 1],
      selectedDay.year
    );

    if (mode === "cumulative") {
      incomeSeries = cumulative.map((t: TotalType) => t.income);
      expensesSeries = cumulative.map((t: TotalType) => t.expenses);
      balanceSeries = cumulative.map((t: TotalType) => t.balance);
    } else {
      let prevIncome = 0;
      let prevExpenses = 0;
      incomeSeries = cumulative.map((t: TotalType) => {
        const v = t.income - prevIncome;
        prevIncome = t.income;
        return v;
      });
      expensesSeries = cumulative.map((t: TotalType) => {
        const v = t.expenses - prevExpenses;
        prevExpenses = t.expenses;
        return v;
      });
      balanceSeries = cumulative.map((t: TotalType, i) =>
        i === 0 ? t.balance : t.balance - cumulative[i - 1].balance
      );
    }
  } else {
    labels.push(...months);
    xTitle = "Month";
    const perMonth = months.map((m) =>
      getMonthTotal(transactions, m, selectedDay.year)
    );
    if (mode === "cumulative") {
      let income = 0;
      let expenses = 0;
      let balance = 0;
      perMonth.forEach((t) => {
        income += t.income;
        expenses += t.expenses;
        balance += t.balance;
        incomeSeries.push(income);
        expensesSeries.push(expenses);
        balanceSeries.push(balance);
      });
    } else {
      incomeSeries = perMonth.map((t) => t.income);
      expensesSeries = perMonth.map((t) => t.expenses);
      balanceSeries = perMonth.map((t) => t.balance);
    }
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeSeries,
        borderColor: COLOUR_POSITIVE,
        backgroundColor: toRgba(COLOUR_POSITIVE, 0.1),
        pointBackgroundColor: COLOUR_POSITIVE,
        tension: 0.35,
        fill: false
      },
      {
        label: "Expenses",
        data: expensesSeries,
        borderColor: COLOUR_NEGATIVE,
        backgroundColor: toRgba(COLOUR_NEGATIVE, 0.1),
        pointBackgroundColor: COLOUR_NEGATIVE,
        tension: 0.35,
        fill: false
      },
      {
        label: "Balance",
        data: balanceSeries,
        borderColor: COLOUR_BALANCE,
        backgroundColor: toRgba(COLOUR_BALANCE, 0.1),
        pointBackgroundColor: COLOUR_BALANCE,
        tension: 0.35,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: baseChartTheme.text,
          font: { family: "Nunito Sans, sans-serif", size: 12 },
          usePointStyle: true,
          padding: 16
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: baseChartTheme.tooltipBg,
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        borderWidth: 1,
        borderColor: baseChartTheme.tooltipBorder,
        callbacks: {
          label: (ctx: unknown) => {
            const c = ctx as { dataset: { label?: string }; parsed: { y: number } };
            return ` ${c.dataset.label}: ${tooltipAmount(c.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: baseChartTheme.grid },
        title: { display: true, text: "Amount ($)", color: baseChartTheme.text },
        ticks: {
          color: baseChartTheme.text,
          callback: formatTickCurrency
        }
      },
      x: {
        grid: { display: false },
        title: { display: true, text: xTitle, color: baseChartTheme.text },
        ticks: { color: baseChartTheme.text, maxRotation: 0, autoSkip: true }
      }
    }
  };

  return (
    <div className="cashflow-card">
      <div className="cashflow-head">
        <div>
          <h3 className="card-title">Cash Flow</h3>
          <p className="card-subtitle">
            {scope === "month"
              ? `${months[selectedDay.month - 1]} ${selectedDay.year}`
              : `${selectedDay.year}`}
          </p>
        </div>
        <div className="segmented" role="tablist" aria-label="cash flow mode">
          <button
            className={mode === "cumulative" ? "seg seg-active" : "seg"}
            onClick={() => setMode("cumulative")}
          >
            Cumulative
          </button>
          <button
            className={mode === "perPoint" ? "seg seg-active" : "seg"}
            onClick={() => setMode("perPoint")}
          >
            {scope === "month" ? "Per day" : "Per month"}
          </button>
        </div>
      </div>
      <div className="cashflow-canvas">
        <Line data={data} options={options as never} />
      </div>
    </div>
  );
};

export default CashFlowChart;