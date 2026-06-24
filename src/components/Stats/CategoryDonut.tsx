import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import {
  CategoryBreakdownItem,
  formatCurrency
} from "../../util/functions";
import { toRgba, tooltipAmount, baseChartTheme } from "../../util/chartUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDonutProps {
  breakdown: { income: CategoryBreakdownItem[]; expenses: CategoryBreakdownItem[] };
  type: "Income" | "Expense";
  title: string;
}

const CategoryDonut = ({ breakdown, type, title }: CategoryDonutProps) => {
  const list = type === "Income" ? breakdown.income : breakdown.expenses;
  const total = list.reduce((sum, i) => sum + i.total, 0);
  const isIncome = type === "Income";
  const accent = isIncome
    ? "rgba(34, 197, 94, 0.18)"
    : "rgba(239, 68, 68, 0.18)";

  if (list.length === 0) {
    return (
      <div className="donut-card">
        <h3 className="donut-title">{title}</h3>
        <p className="donut-empty">
          No {type.toLowerCase()} categories for this period.
        </p>
      </div>
    );
  }

  const data = {
    labels: list.map((i) => i.name),
    datasets: [
      {
        data: list.map((i) => i.total),
        backgroundColor: list.map((i) => toRgba(i.color, 0.75)),
        borderColor: list.map((i) => toRgba(i.color, 1)),
        borderWidth: 1.5,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: baseChartTheme.tooltipBg,
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        borderWidth: 1,
        borderColor: baseChartTheme.tooltipBorder,
        callbacks: {
          label: (ctx: { parsed: number; label: string }) => {
            const value = ctx.parsed;
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${ctx.label}: ${tooltipAmount(value)} (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="donut-card">
      <div className="donut-head">
        <h3 className="donut-title">{title}</h3>
        <span
          className={`donut-total ${isIncome ? "positive" : "negative"}`}
          style={{ background: accent }}
        >
          {isIncome ? "+" : "-"}${formatCurrency(total)}
        </span>
      </div>
      <div className="donut-body">
        <div className="donut-canvas-wrap">
          <Doughnut data={data} options={options} />
          <div className="donut-center">
            <span className="donut-center-label">
              {isIncome ? "Income" : "Expenses"}
            </span>
            <span className="donut-center-total">
              ${formatCurrency(total)}
            </span>
          </div>
        </div>
        <ul className="donut-legend">
          {list.map((item) => {
            const pct = total > 0 ? (item.total / total) * 100 : 0;
            return (
              <li key={item.name} className="donut-legend-item">
                <span
                  className="donut-legend-dot"
                  style={{ background: toRgba(item.color, 1) }}
                />
                <span className="donut-legend-name">{item.name}</span>
                <span className="donut-legend-amount">
                  ${formatCurrency(item.total)}
                </span>
                <span className="donut-legend-pct">{pct.toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CategoryDonut;