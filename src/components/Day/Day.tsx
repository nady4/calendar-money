import React, { useState, useEffect } from "react";
import Transaction from "../Transaction/Transaction";
import moment from "moment/moment";
import "./Day.scss";
import { getBalanceByDay } from "../../util/balance";
import { getTransactionsFromDay } from "../../util/transactions";

function Day({
  user,
  setDay,
  calendarDay,
  setTransaction,
  triggers,
  setTriggers,
}) {
  let [transactions, setTransactions] = useState([]);
  let [balance, setBalance] = useState(0);

  useEffect(() => {
    setTransactions(getTransactionsFromDay(user.transactions, calendarDay));
    setBalance(getBalanceByDay(user.transactions, calendarDay));
  }, [calendarDay, user.transactions, user.categories]);

  const openDayView = () => {
    setDay(moment(calendarDay));
    setTriggers({ ...triggers, dayView: true });
  };
  const openNewTransaction = () => {
    setDay(moment(calendarDay));
    setTriggers({ ...triggers, newTransaction: true });
  };

  return (
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
        {transactions.map((transaction, txIndex) => {
          return (
            <Transaction
              setDay={setDay}
              transaction={transaction}
              setTransaction={setTransaction}
              triggers={triggers}
              setTriggers={setTriggers}
              isRenderedFromDayView={false}
              key={txIndex}
            />
          );
        })}
      </div>
      <div className="bottom-shadow"></div>
    </div>
  );
}

export default Day;
