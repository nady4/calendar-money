import moment from "moment";
import { TransactionType } from "../types";

const getTransactionsBalances = (transactions: TransactionType[]) => {
  transactions.sort((a, b) => {
    return moment(a.date).isAfter(b.date) ? 1 : -1;
  });

  let balance = 0;
  const balanceByDay: { [date: string]: number } = {};

  transactions.forEach((transaction) => {
    balance +=
      transaction.category.type === "Income"
        ? transaction.amount
        : -transaction.amount;

    const date = moment(transaction.date).format("DD-MM-YYYY");
    balanceByDay[date] = balance;
  });

  return balanceByDay;
};

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

const getTransactionsFromDay = (
  transactions: TransactionType[],
  day: moment.Moment
) => {
  return transactions
    .filter((transaction) => moment(transaction.date).isSame(day.format()))
    .sort((a, b) => {
      return moment(a.date).isAfter(b.date) ? 1 : -1;
    });
};

export { getBalanceByDay, getTransactionsFromDay };
