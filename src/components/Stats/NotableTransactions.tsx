import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import {
  TopTransaction,
  getMonthTopTransactions,
  getYearTopTransactions,
  formatCurrency
} from "../../util/functions";
import { TransactionType } from "../../types";
import { months } from "../../util/constants";
import { toRgba } from "../../util/chartUtils";

interface NotableTransactionsProps {
  transactions: TransactionType[];
  selectedDay: Temporal.PlainDate;
  scope: "month" | "year";
  setSelectedTransaction: React.Dispatch<
    React.SetStateAction<TransactionType | null>
  >;
}

const NotableTransactions = ({
  transactions,
  selectedDay,
  scope,
  setSelectedTransaction
}: NotableTransactionsProps) => {
  const navigate = useNavigate();

  const topExpenses: TopTransaction[] =
    scope === "month"
      ? getMonthTopTransactions(
          transactions,
          "Expense",
          months[selectedDay.month - 1],
          selectedDay.year
        )
      : getYearTopTransactions(transactions, "Expense", selectedDay.year);

  const topIncome: TopTransaction[] =
    scope === "month"
      ? getMonthTopTransactions(
          transactions,
          "Income",
          months[selectedDay.month - 1],
          selectedDay.year
        )
      : getYearTopTransactions(transactions, "Income", selectedDay.year);

  const open = (t: TransactionType) => {
    setSelectedTransaction(t);
    navigate("/edit-transaction");
  };

  const Row = ({ item }: { item: TopTransaction }) => {
    const t = item.transaction;
    const isIncome = t.category.type === "Income";
    return (
      <button className="notable-row" onClick={() => open(t)}>
        <span
          className="notable-dot"
          style={{ background: toRgba(t.category.color, 1) }}
        />
        <span className="notable-desc">{t.description}</span>
        <span className="notable-cat">{t.category.name}</span>
        <span
          className={`notable-amount ${isIncome ? "positive" : "negative"}`}
        >
          {isIncome ? "+" : "-"}${formatCurrency(Math.abs(t.amount))}
        </span>
      </button>
    );
  };

  const List = ({
    list,
    title,
    fallback
  }: {
    list: TopTransaction[];
    title: string;
    fallback: string;
  }) => (
    <div className="notable-section">
      <h3 className="notable-title">{title}</h3>
      {list.length === 0 ? (
        <p className="notable-empty">{fallback}</p>
      ) : (
        <div className="notable-list">
          {list.map((item) => (
            <Row key={item.transaction._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="notable-card card">
      <List
        list={topExpenses}
        title="Biggest Expenses"
        fallback="No expenses in this period."
      />
      <div className="notable-divider" />
      <List
        list={topIncome}
        title="Largest Income"
        fallback="No income in this period."
      />
    </div>
  );
};

export default NotableTransactions;