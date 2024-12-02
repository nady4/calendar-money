import { Temporal } from "@js-temporal/polyfill";
import { TransactionType, TotalType } from "../types";

const toPlainDate = (date: string | Temporal.PlainDate): Temporal.PlainDate => {
  if (typeof date === "string") {
    return Temporal.PlainDate.from(date.split("T")[0]);
  }
  return date;
};

const getDaysWithTransactionsTotal = (transactions: TransactionType[]) => {
  transactions.sort((a, b) => {
    return toPlainDate(a.date.toString()).since(toPlainDate(b.date.toString()))
      .sign;
  });

  const total: {
    [date: string]: TotalType;
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

    const date = transaction.date.toString();
    total[date] = {
      income,
      expenses,
      balance,
    };
  });

  return total;
};

const getDayTotal = (
  transactions: TransactionType[],
  day: Temporal.PlainDate
): TotalType => {
  const daysWithTransactionsTotal = getDaysWithTransactionsTotal(transactions);
  const dates = Object.keys(daysWithTransactionsTotal);

  dates.sort((a, b) =>
    Temporal.PlainDate.compare(toPlainDate(a), toPlainDate(b))
  );

  let total: TotalType = {
    income: 0,
    expenses: 0,
    balance: 0,
  };

  for (const date of dates) {
    const parsedDate = toPlainDate(date);

    if (Temporal.PlainDate.compare(parsedDate, day) <= 0) {
      total = daysWithTransactionsTotal[date];
    } else {
      break;
    }
  }

  return total;
};

const getDaysTotal = (
  transactions: TransactionType[],
  calendarDays: Temporal.PlainDate[]
): {
  [date: string]: TotalType;
} => {
  const daysWithTransactionsTotal = getDaysWithTransactionsTotal(transactions);

  const total: {
    [date: string]: TotalType;
  } = {};

  let lastKnownTotal: TotalType = {
    income: 0,
    expenses: 0,
    balance: 0,
  };

  for (const day of calendarDays) {
    const date = day.toString();

    if (daysWithTransactionsTotal[date]) {
      lastKnownTotal = daysWithTransactionsTotal[date];
    }

    total[date] = { ...lastKnownTotal };
  }

  return total;
};

const getDayTransactions = (
  transactions: TransactionType[],
  day: Temporal.PlainDate
): TransactionType[] => {
  return transactions
    .filter(
      (transaction) =>
        Temporal.PlainDate.compare(toPlainDate(transaction.date), day) === 0
    )
    .sort((a, b) => {
      return Temporal.PlainDate.compare(
        toPlainDate(a.date),
        toPlainDate(b.date)
      );
    });
};

const getDaysTransactions = (
  transactions: TransactionType[],
  days: Temporal.PlainDate[]
): { [date: string]: TransactionType[] } => {
  const result: { [date: string]: TransactionType[] } = {};
  days.forEach((day) => {
    const formattedDate = day.toString();
    result[formattedDate] = [];
  });

  transactions.forEach((transaction) => {
    const transactionDate = transaction.date.toString();
    if (result[transactionDate]) {
      result[transactionDate].push(transaction);
    }
  });

  for (const date in result) {
    result[date].sort((a, b) => a.date.since(b.date).sign);
  }

  return result;
};

export { getDayTotal, getDaysTotal, getDayTransactions, getDaysTransactions };
