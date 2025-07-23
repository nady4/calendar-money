import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getYearlyTotalFromCategories } from "../../util/functions";
import { TransactionType, CategoryType } from "../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YearCategoryBarChartProps {
  transactions: TransactionType[];
  categories: CategoryType[];
  selectedYear: number;
}

const YearCategoryBarChart: React.FC<YearCategoryBarChartProps> = ({
  transactions,
  categories,
  selectedYear,
}) => {
  const yearlyTotals = getYearlyTotalFromCategories(
    transactions,
    categories,
    selectedYear
  );

  const filteredTotals = Object.entries(yearlyTotals)
    .filter(([, total]) => total !== 0)
    .map(([categoryName, total]) => {
      const category = categories.find((cat) => cat.name === categoryName);
      return {
        categoryName,
        balance: total,
        color: category?.color || "rgba(59, 130, 246, 0.6)",
      };
    });

  const chartData = {
    labels: filteredTotals.map((item) => item.categoryName),
    datasets: [
      {
        label: "Balance",
        data: filteredTotals.map((item) => item.balance),
        backgroundColor: filteredTotals.map((item) =>
          item.color.includes("rgba")
            ? item.color
            : item.color.replace(")", ", 0.6)").replace("rgb", "rgba")
        ),
        borderColor: filteredTotals.map((item) =>
          item.color.includes("rgba")
            ? item.color.replace("0.6", "1")
            : item.color
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${selectedYear} Categories`,
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
      x: {
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
      y: {
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

  return <Bar data={chartData} options={chartOptions} />;
};

export default YearCategoryBarChart;
