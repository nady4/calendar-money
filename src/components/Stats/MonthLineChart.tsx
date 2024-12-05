import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Temporal } from "@js-temporal/polyfill";
import { getDailyMonthTotals } from "../../util/functions";
import { TransactionType } from "../../types";
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

interface MonthLineChartProps {
  transactions: TransactionType[];
  selectedDay: Temporal.PlainDate;
}

const MonthLineChart = ({ transactions, selectedDay }: MonthLineChartProps) => {
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

  const monthlyTotals = getDailyMonthTotals(
    transactions,
    months[selectedDay.month - 1],
    selectedDay.year
  );

  const chartData = {
    labels: dayLabels,
    datasets: [
      {
        label: "Income",
        data: monthlyTotals.map((total) => total.income),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        pointBackgroundColor: "rgb(34, 197, 94)",
        tension: 0.4,
      },
      {
        label: "Expenses",
        data: monthlyTotals.map((total) => total.expenses),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        pointBackgroundColor: "rgb(239, 68, 68)",
        tension: 0.4,
      },
      {
        label: "Balance",
        data: monthlyTotals.map((total) => total.balance),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        pointBackgroundColor: "rgb(59, 130, 246)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#4B5563",
          font: {
            family: "Nunito Sans, sans-serif",
            size: 14,
            weight: "bold" as const,
          },
        },
      },
      title: {
        display: true,
        text: `${months[selectedDay.month - 1]}`,
        color: "#1F2937",
        font: {
          family: "Nunito Sans, sans-serif",
          size: 18,
          weight: "bold" as const,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#FFFFFF",
        bodyColor: "#E5E7EB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        title: {
          display: true,
          color: "#374151",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#4B5563",
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          color: "#374151",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#4B5563",
        },
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default MonthLineChart;
