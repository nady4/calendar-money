import moment from "moment";
import { getTransactionsBalances } from "./transactions";

const getBalanceByDay = (transactions, day) => {
  const transactionsBalances = getTransactionsBalances(transactions);
  const dates = Object.keys(transactionsBalances);
  let balance = 0;

  for (const date of dates) {
    if (
      moment(date, "DD-MM-YYYY").isSame(day) ||
      moment(date, "DD-MM-YYYY").isBefore(day)
    ) {
      balance = transactionsBalances[date];
    } else {
      break;
    }
  }

  return balance;
};

const calculateBalance = (transactions) => {
  let balance = 0;
  transactions.forEach((transaction) => {
    balance += transaction.amount;
  });
  return balance;
};

export { getBalanceByDay, calculateBalance };
