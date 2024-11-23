import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
import Transaction from "../Transaction/Transaction";
import { getBalanceByDay } from "../../util/balance";
import { getTransactionsFromDay } from "../../util/transactions";
import { UserType, TransactionType } from "../../types.d";
import "../../styles/Day.scss";

interface DayProps {
  user: UserType;
  setDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
  day: moment.Moment;
}

function Day({ user, day, setDay }: DayProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setTransactions(getTransactionsFromDay(user.transactions, day));
    setBalance(getBalanceByDay(user.transactions, day));
  }, [day, user.transactions, user.categories]);

  const openTransactions = () => {
    setDay(moment(day));
    navigate("/transactions");
  };
  const openNewTransaction = () => {
    setDay(moment(day));
    navigate("/new-transaction");
  };

  return (
    <div className="calendar-day">
      <div className="day-header">
        <div className="day-balance-container">
          <p className="day-balance">${balance}</p>
        </div>
        <div className="day-date-container">
          <p className="day-date">{day.format("D")}</p>
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
