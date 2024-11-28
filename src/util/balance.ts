import moment from "moment";
import { TransactionType } from "../types.d";
import { getTransactionsBalances } from "./transactions";

const getBalanceByDay = (
  transactions: TransactionType[],
  day: moment.Moment
) => {
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

const calculateBalance = (transactions: TransactionType[]) => {
  let balance = 0;
  transactions.forEach((transaction) => {
    if (transaction.category.type === "Income") balance += transaction.amount;
    else balance -= transaction.amount;
  });
  return balance;
};

export { getBalanceByDay, calculateBalance };
