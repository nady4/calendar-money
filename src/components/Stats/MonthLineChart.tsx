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
import { getDailyMonthTotals } from "../../util/functions";
import { TransactionType } from "../../types";

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
  month: string;
}

const MonthLineChart = ({ transactions, month }: MonthLineChartProps) => {
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

  const monthlyTotals = getDailyMonthTotals(transactions, month);

  const chartData = {
    labels: dayLabels,
    datasets: [
      {
        label: "Income",
        data: monthlyTotals.map((total) => total.income),
        borderColor: "rgb(0, 150, 50)",
        backgroundColor: "rgba(0, 150, 50, 0.1)",
        tension: 0.1,
      },
      {
        label: "Expenses",
        data: monthlyTotals.map((total) => total.expenses),
        borderColor: "rgb(240, 30, 30)",
        backgroundColor: "rgba(240, 30, 30, 0.1)",
        tension: 0.1,
      },
      {
        label: "Balance",
        data: monthlyTotals.map((total) => total.balance),
        borderColor: "rgb(0, 0, 0)",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
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
        text: `${month} Stats`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount",
        },
      },
      x: {
        title: {
          display: true,
          text: "Days of Month",
        },
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default MonthLineChart;
