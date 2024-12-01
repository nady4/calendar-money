import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
import Transaction from "../Transaction/Transaction";
import { getDayTotal, getDayTransactions } from "../../util/functions";
import { UserType, TransactionType } from "../../types.d";
import "../../styles/Day.scss";

interface DayProps {
  user: UserType;
  date: moment.Moment;
  selectedDay: moment.Moment;
  setSelectedDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
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
  const isActiveMonth = selectedDay.month() === date.month();
  const isActiveDay = date.isSame(moment(), "day");
  const navigate = useNavigate();

  useEffect(() => {
    setTransactions(getDayTransactions(user.transactions, date));
    setTotal(getDayTotal(user.transactions, date));
  }, [date, user.transactions]);

  const openTransactions = () => {
    setSelectedDay(moment(date));
    navigate("/transactions");
  };
  const openNewTransaction = () => {
    setSelectedDay(moment(date));
    navigate("/new-transaction");
  };

  return (
    <div
      className={`${isActiveDay ? "active-day" : "inactive-day"}
        ${isActiveMonth ? "active-month" : "inactive-month"} ${
        total.balance < 0 ? "negative" : "positive"
      } calendar-day`}
    >
      <div className="day-header">
        <div className="day-balance-container">
          <p className="day-balance">${total.balance}</p>
        </div>
        <div className="day-date-container">
          <p className="day-date">{date.format("D")}</p>
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
      <div className="transactions-container" onClick={openTransactions}>
        {transactions.map((transaction: TransactionType, index: number) => {
          return <Transaction transaction={transaction} key={index} />;
        })}
      </div>
    </div>
  );
}

export default Day;
