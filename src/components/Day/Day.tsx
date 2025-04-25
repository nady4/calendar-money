import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { getDayTotal, getDayTransactions } from "../../util/functions";
import { UserType, TransactionType } from "../../types.d";
import "../../styles/Day.scss";

interface DayProps {
  user: UserType;
  date: Temporal.PlainDate;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
}

function Day({ date, user, selectedDay, setSelectedDay }: DayProps) {
  const [total, setTotal] = useState<{
    income: number;
    expenses: number;
    balance: number;
  }>({
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const isActiveMonth = selectedDay.month === date.month;
  const isActiveDay = date.equals(Temporal.Now.plainDate("gregory"));
  const navigate = useNavigate();

  useEffect(() => {
    setTransactions(getDayTransactions(user.transactions, date));
    setTotal(getDayTotal(user.transactions, date));
  }, [date, user.transactions]);

  const openTransactions = () => {
    setSelectedDay(date);
    navigate("/transactions");
  };
  const openNewTransaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDay(date);
    navigate("/new-transaction");
  };

  return (
    <div
      className={`${isActiveDay ? "active-day" : "inactive-day"}
        ${isActiveMonth ? "active-month" : "inactive-month"} ${
        total.balance < 0 ? "negative" : "positive"
      } calendar-day`}
      onClick={openTransactions}
    >
      <div className="day-header">
        <div className="day-balance-container">
          <p className="day-balance">${total.balance}</p>
        </div>
        <div className="day-date-container">
          <p className="day-date">{date.day}</p>
        </div>
        <div className="add-transaction-button-container">
          <button
            className="add-transaction-button"
            onClick={openNewTransaction}
          >
            +
          </button>
        </div>
      </div>
      <div className="transactions-container">
        {transactions.map((transaction: TransactionType) => {
          return (
            <div className="day-item" key={transaction._id}>
              <div
                className="item-color"
                style={{ backgroundColor: transaction.category.color }}
              ></div>
              <div className="item-amount">
                {transaction.category.type === "Income" ? "+" : "-"}$
                {transaction.amount}
              </div>
              <div className="item-description">
                {transaction.description == transaction.description.slice(0, 10)
                  ? transaction.description
                  : transaction.description.slice(0, 8) + "..."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(Day);
