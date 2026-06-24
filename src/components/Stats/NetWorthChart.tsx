import { useMemo } from "react";
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
import {
  getAllTimeNetWorth,
  formatCurrency
} from "../../util/functions";
import { TransactionType } from "../../types";
import {
  COLOUR_BALANCE,
  toRgba,
  formatTickCurrency,
  tooltipAmount,
  formatDateLabel,
  baseChartTheme
} from "../../util/chartUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface NetWorthChartProps {
  transactions: TransactionType[];
}

const NetWorthChart = ({ transactions }: NetWorthChartProps) => {
  const points = useMemo(() => getAllTimeNetWorth(transactions), [transactions]);

  const data = {
    labels: points.map((p) => formatDateLabel(p.date)),
    datasets: [
      {
        label: "Net Balance",
        data: points.map((p) => p.balance),
        borderColor: COLOUR_BALANCE,
        backgroundColor: toRgba(COLOUR_BALANCE, 0.12),
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: COLOUR_BALANCE,
        tension: 0.25,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: baseChartTheme.tooltipBg,
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        borderWidth: 1,
        borderColor: baseChartTheme.tooltipBorder,
        callbacks: {
          label: (ctx: unknown) => {
            const c = ctx as { parsed: { y: number } };
            return ` Balance: ${tooltipAmount(c.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: baseChartTheme.grid },
        title: { display: true, text: "Balance ($)", color: baseChartTheme.text },
        ticks: {
          color: baseChartTheme.text,
          callback: formatTickCurrency
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: baseChartTheme.text,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      }
    }
  };

  const latest = points.length > 0 ? points[points.length - 1].balance : 0;
  const first = points.length > 0 ? points[0].balance : 0;
  const change = latest - first;

  return (
    <div className="networth-card">
      <div className="networth-head">
        <div>
          <h3 className="card-title">All-Time Net Worth</h3>
          <p className="card-subtitle">Cumulative balance across all time</p>
        </div>
        <div className="networth-stat">
          <span className="networth-value">
            ${formatCurrency(latest)}
          </span>
          {points.length > 1 && (
            <span
              className={`networth-change ${change >= 0 ? "positive" : "negative"}`}
            >
              {change >= 0 ? "▲" : "▼"} ${formatCurrency(Math.abs(change))}
            </span>
          )}
        </div>
      </div>
      <div className="networth-canvas">
        <Line data={data} options={options as never} />
      </div>
    </div>
  );
};

export default NetWorthChart;