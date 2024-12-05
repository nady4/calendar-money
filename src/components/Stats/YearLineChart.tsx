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
}: {
  transactions: TransactionType[];
}) => {
  const monthlyTotals = months.map((month) =>
    getMonthTotal(transactions, month, 2024)
  );

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: monthlyTotals.map((total) => total.income),
        borderColor: "rgb(0, 150, 50)",
        tension: 0.1,
      },
      {
        label: "Expenses",
        data: monthlyTotals.map((total) => total.expenses),
        borderColor: "rgb(240, 30, 30)",
        tension: 0.1,
      },
      {
        label: "Balance",
        data: monthlyTotals.map((total) => total.balance),
        borderColor: "rgb(0, 0, 0)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Year Stats",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default YearLineChart;
