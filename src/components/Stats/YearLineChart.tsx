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
import { TransactionType } from "../../types";
import { getMonthTotal } from "../../util/functions";
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

const YearLineChart = ({
  transactions,
  selectedDay,
}: {
  transactions: TransactionType[];
  selectedDay: Temporal.PlainDate;
}) => {
  const monthlyTotals = months.map((month) =>
    getMonthTotal(transactions, month, selectedDay.year)
  );

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: monthlyTotals.map((total) => total.income),
        borderColor: "rgb(34, 197, 94)", // Modern green
        backgroundColor: "rgba(34, 197, 94, 0.1)", // Translucent fill
        pointBackgroundColor: "rgb(34, 197, 94)", // Highlight points
        tension: 0.4, // Smoother lines
      },
      {
        label: "Expenses",
        data: monthlyTotals.map((total) => total.expenses),
        borderColor: "rgb(239, 68, 68)", // Modern red
        backgroundColor: "rgba(239, 68, 68, 0.1)", // Translucent fill
        pointBackgroundColor: "rgb(239, 68, 68)", // Highlight points
        tension: 0.4,
      },
      {
        label: "Balance",
        data: monthlyTotals.map((total) => total.balance),
        borderColor: "rgb(59, 130, 246)", // Modern blue
        backgroundColor: "rgba(59, 130, 246, 0.1)", // Translucent fill
        pointBackgroundColor: "rgb(59, 130, 246)", // Highlight points
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
          color: "#4B5563", // Subtle gray
          font: {
            family: "Nunito Sans, sans-serif",
            size: 14,
            weight: "bold" as const,
          },
        },
      },
      title: {
        display: true,
        text: `${selectedDay.year}`,
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
          color: "rgba(156, 163, 175, 0.2)", // Light gray
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

export default YearLineChart;
