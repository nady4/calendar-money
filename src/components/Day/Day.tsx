import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
import Transaction from "../Transaction/Transaction";
import { UserType, TransactionType } from "../../types.d";
import "../../styles/Day.scss";

interface DayProps {
  user: UserType;
  date: moment.Moment;
  total: {
    income: number;
    expenses: number;
    balance: number;
  };
  transactions: TransactionType[] | [];
  selectedDay: moment.Moment;
  setSelectedDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

function Day({
  user,
  date,
  transactions,
  total,
  selectedDay,
  setSelectedDay,
}: DayProps) {
  const [balance, setBalance] = useState(0);
  const isActiveMonth = selectedDay.month() === date.month();
  const isActiveDay = date.isSame(moment(), "day");
  const navigate = useNavigate();

  useEffect(() => {
    setBalance(total.balance);
  }, [date, user.transactions, total.balance]);

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
        balance < 0 ? "negative" : "positive"
      } calendar-day`}
    >
      <div className="day-header">
        <div className="day-balance-container">
          <p className="day-balance">${balance}</p>
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
