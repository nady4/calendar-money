import moment from "moment";
import { TransactionType } from "../types";

const getDaysWithTransactionsTotal = (transactions: TransactionType[]) => {
  transactions.sort((a, b) => {
    return moment(a.date).isAfter(b.date) ? 1 : -1;
  });

  const total: {
    [date: string]: {
      income: number;
      expenses: number;
      balance: number;
    };
  } = {};

  let income = 0;
  let expenses = 0;
  let balance = 0;

  transactions.forEach((transaction) => {
    if (transaction.category.type === "Income") {
      income += transaction.amount;
    } else {
      expenses += transaction.amount;
    }
    balance = income - expenses;

    const date = moment(transaction.date).format("DD-MM-YYYY");
    total[date] = {
      income,
      expenses,
      balance,
    };
  });

  return total;
};

const getDaysTotal = (
  transactions: TransactionType[],
  calendarDays: moment.Moment[]
): {
  [date: string]: { income: number; expenses: number; balance: number };
} => {
  const daysWithTransactionsTotal = getDaysWithTransactionsTotal(transactions);

  const total: {
    [date: string]: {
      income: number;
      expenses: number;
      balance: number;
    };
  } = {};

  let lastKnownTotal: { income: number; expenses: number; balance: number } = {
    income: 0,
    expenses: 0,
    balance: 0,
  };

  for (const day of calendarDays) {
    const date = moment(day).format("DD-MM-YYYY");

    if (daysWithTransactionsTotal[date]) {
      lastKnownTotal = daysWithTransactionsTotal[date];
    }

    total[date] = { ...lastKnownTotal };
  }

  return total;
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

const getDaysTransactions = (
  transactions: TransactionType[],
  days: moment.Moment[]
): { [date: string]: TransactionType[] } => {
  const result: { [date: string]: TransactionType[] } = {};
  days.forEach((day) => {
    const formattedDate = day.format("DD-MM-YYYY");
    result[formattedDate] = [];
  });

  transactions.forEach((transaction) => {
    const transactionDate = moment(transaction.date).format("DD-MM-YYYY");
    if (result[transactionDate]) {
      result[transactionDate].push(transaction);
    }
  });

  for (const date in result) {
    result[date].sort((a, b) => (moment(a.date).isAfter(b.date) ? 1 : -1));
  }

  return result;
};

export { getDaysTotal, getDayTransactions, getDaysTransactions };
