import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
import Transaction from "../Transaction/Transaction";
import EditTransaction from "../Transaction/EditTransaction";
import { getBalanceByDay } from "../../util/balance";
import { getTransactionsFromDay } from "../../util/transactions";
import { UserType, TransactionType } from "../../types.d";
import "./Day.scss";

interface DayProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  setDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
  calendarDay: moment.Moment;
}

function Day({ user, setUser, setDay, calendarDay }: DayProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType | null>();
  const navigate = useNavigate();

  useEffect(() => {
    setTransactions(getTransactionsFromDay(user.transactions, calendarDay));
    setBalance(getBalanceByDay(user.transactions, calendarDay));
  }, [calendarDay, user.transactions, user.categories]);

  const openDayView = () => {
    setDay(moment(calendarDay));
    //setTriggers({ ...triggers, dayView: true });
  };
  const openNewTransaction = () => {
    setDay(moment(calendarDay));
    navigate("/new-transaction");
  };

  return (
    <>
      {selectedTransaction ? (
        <EditTransaction
          user={user}
          setUser={setUser}
          transaction={selectedTransaction}
        />
      ) : (
        <div className="calendar-day" onClick={openDayView}>
          <div className="day-header">
            <div className="day-date-container">
              <p className="day-date">{calendarDay.format("D")}</p>
            </div>
            <div className="day-balance-container">
              <p className="day-balance">${balance}</p>
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
            {transactions.map((transaction, index) => {
              return (
                <div
                  key={index}
                  className="item"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <Transaction transaction={transaction} key={index} />
                </div>
              );
            })}
          </div>
          <div className="bottom-shadow"></div>
        </div>
      )}
    </>
  );
}

export default Day;
