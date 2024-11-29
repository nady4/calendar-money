import moment from "moment";
import { TransactionType } from "../types";

const getTransactionsBalance = (transactions: TransactionType[]) => {
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

const getDayBalance = (transactions: TransactionType[], day: moment.Moment) => {
  const transactionsBalances = getTransactionsBalance(transactions);
  const dates = Object.keys(transactionsBalances);
  let balance = 0;

  for (const date of dates) {
    const parsedDate = moment(date, "DD-MM-YYYY");

    if (parsedDate.isSame(day) || parsedDate.isBefore(day)) {
      balance = transactionsBalances[date];
    } else {
      break;
    }
  }

  return balance;
};

const getDayTransactions = (
  transactions: TransactionType[],
  day: moment.Moment
) => {
  return transactions
    .filter((transaction) => moment(transaction.date).isSame(day.format()))
    .sort((a, b) => {
      return moment(a.date).isAfter(b.date) ? 1 : -1;
    });
};

export { getDayBalance, getDayTransactions };
