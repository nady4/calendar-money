import { TransactionType } from "../../types";
import MonthLineChart from "../../components/Stats/MonthLineChart";
import YearLineChart from "../../components/Stats/YearLineChart";

const Stats = ({ transactions }: { transactions: TransactionType[] }) => {
  return (
    <div className="stats-container">
      <MonthLineChart transactions={transactions} month="November" />
      <YearLineChart transactions={transactions} />
    </div>
  );
};

export default Stats;
