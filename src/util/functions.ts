import { Temporal } from "@js-temporal/polyfill";
import { monthNameToNumber } from "./constants";
import { TransactionType, CategoryType, TotalType } from "../types";

const toPlainDate = (date: string | Temporal.PlainDate): Temporal.PlainDate => {
  if (typeof date === "string") {
    return Temporal.PlainDate.from(date.split("T")[0]);
  }
  return date;
};

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const getDayTransactions = (
  transactions: TransactionType[],
  day: Temporal.PlainDate
): TransactionType[] => {
  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  const exactDateMatches = processedTransactions.filter(
    (transaction) =>
      Temporal.PlainDate.compare(
        transaction.date as Temporal.PlainDate,
        day
      ) === 0
  );

  const weeklyRepeats = processedTransactions.filter((transaction) => {
    if (transaction.repeat === "weekly") {
      if (day.dayOfWeek !== transaction.date.dayOfWeek) return false;
      const txWeek = transaction.date.year * 52 + transaction.date.dayOfWeek;
      const dayWeek = day.year * 52 + day.dayOfWeek;
      return dayWeek >= txWeek;
    }
    return false;
  });

  const monthlyRepeats = processedTransactions.filter((transaction) => {
    if (transaction.repeat === "monthly") {
      if (day.day !== transaction.date.day) return false;
      const txKey = transaction.date.year * 12 + transaction.date.month;
      const dayKey = day.year * 12 + day.month;
      return dayKey >= txKey;
    }
    return false;
  });

  return [...exactDateMatches, ...weeklyRepeats, ...monthlyRepeats].sort(
    (a, b) => {
      return Temporal.PlainDate.compare(
        a.date as Temporal.PlainDate,
        b.date as Temporal.PlainDate
      );
    }
  );
};

const getDaysWithTransactionsTotal = (
  transactions: TransactionType[]
): {
  [date: string]: TotalType;
} => {
  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  processedTransactions.sort((a, b) => {
    return Temporal.PlainDate.compare(a.date, b.date);
  });

  const total: {
    [date: string]: TotalType;
  } = {};

  let income = 0;
  let expenses = 0;

  processedTransactions.forEach((transaction) => {
    if (transaction.category.type === "Income") {
      income += transaction.amount;
    } else {
      expenses += transaction.amount;
    }

    const dateKey = transaction.date.toString();
    total[dateKey] = {
      income,
      expenses,
      balance: income - expenses
    };
  });

  return total;
};

const getDailyMonthTotals = (
  transactions: TransactionType[],
  month: string,
  year: number
): TotalType[] => {
  const monthNumber = monthNameToNumber[month];
  if (!monthNumber) {
    return [];
  }

  let daysInMonth;
  try {
    daysInMonth = Temporal.PlainYearMonth.from({
      year,
      month: monthNumber
    }).daysInMonth;
  } catch (e) {
    console.error("Error getting days in month:", e);
    return [];
  }

  const dailyTotals: TotalType[] = Array(daysInMonth)
    .fill(null)
    .map(() => ({
      income: 0,
      expenses: 0,
      balance: 0
    }));

  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  processedTransactions.forEach((transaction) => {
    if (
      transaction.date.year === year &&
      transaction.date.month === monthNumber
    ) {
      const dayIndex = transaction.date.day - 1;

      if (transaction.category.type === "Income") {
        dailyTotals[dayIndex].income += transaction.amount;
      } else {
        dailyTotals[dayIndex].expenses += transaction.amount;
      }
    }
  });

  let income = 0;
  let expenses = 0;

  const dailyRunningTotals = dailyTotals.map((daily) => {
    income += daily.income;
    expenses += daily.expenses;

    return {
      income,
      expenses,
      balance: income - expenses
    };
  });

  return dailyRunningTotals;
};

const getDayTotal = (
  transactions: TransactionType[],
  day: Temporal.PlainDate
): TotalType => {
  const daysWithTransactionsTotal = getDaysWithTransactionsTotal(transactions);
  const dates = Object.keys(daysWithTransactionsTotal);

  dates.sort((a, b) =>
    Temporal.PlainDate.compare(
      Temporal.PlainDate.from(a),
      Temporal.PlainDate.from(b)
    )
  );

  let total: TotalType = {
    income: 0,
    expenses: 0,
    balance: 0
  };

  let low = 0;
  let high = dates.length - 1;
  let foundDateKey: string | null = null;

  while (low <= high) {
    const midIndex = Math.floor((low + high) / 2);
    const midDate = Temporal.PlainDate.from(dates[midIndex]);
    const comparison = Temporal.PlainDate.compare(midDate, day);

    if (comparison <= 0) {
      foundDateKey = dates[midIndex];
      low = midIndex + 1;
    } else {
      high = midIndex - 1;
    }
  }

  if (foundDateKey !== null) {
    total = daysWithTransactionsTotal[foundDateKey];
  }

  return total;
};

const getMonthTotal = (
  transactions: TransactionType[],
  month: string,
  year: number
): TotalType => {
  const monthNumber = monthNameToNumber[month];
  if (!monthNumber) {
    return { income: 0, expenses: 0, balance: 0 };
  }

  const total: TotalType = {
    income: 0,
    expenses: 0,
    balance: 0
  };

  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  const relevantTransactions = processedTransactions.filter(
    (transaction) =>
      transaction.date.year === year && transaction.date.month === monthNumber
  );

  for (const transaction of relevantTransactions) {
    if (transaction.category.type === "Income") {
      total.income += transaction.amount;
    } else {
      total.expenses += transaction.amount;
    }
  }

  total.balance = total.income - total.expenses;

  return total;
};

const getMonthlyTotalFromCategories = (
  transactions: TransactionType[],
  categories: CategoryType[],
  month: string,
  year: number
): { [Category: string]: number } => {
  const categoryMap: { [name: string]: CategoryType } = {};
  categories.forEach((category) => {
    categoryMap[category.name] = category;
  });

  const monthNumber = monthNameToNumber[month];
  if (!monthNumber) {
    const initialTotal: { [Category: string]: number } = {};
    categories.forEach((category) => {
      initialTotal[category.name] = 0;
    });
    return initialTotal;
  }

  const total: { [Category: string]: number } = {};
  categories.forEach((category) => {
    total[category.name] = 0;
  });

  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  const relevantTransactions = processedTransactions.filter(
    (transaction) =>
      transaction.date.year === year && transaction.date.month === monthNumber
  );

  for (const transaction of relevantTransactions) {
    const categoryName = transaction.category.name;
    if (Object.prototype.hasOwnProperty.call(total, categoryName)) {
      total[categoryName] += transaction.amount;
    }
  }
  return total;
};

const getYearlyTotalFromCategories = (
  transactions: TransactionType[],
  categories: CategoryType[],
  year: number
): { [Category: string]: number } => {
  const categoryMap: { [name: string]: CategoryType } = {};
  categories.forEach((category) => {
    categoryMap[category.name] = category;
  });

  const total: { [Category: string]: number } = {};
  categories.forEach((category) => {
    total[category.name] = 0;
  });

  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  const relevantTransactions = processedTransactions.filter(
    (transaction) => transaction.date.year === year
  );

  for (const transaction of relevantTransactions) {
    const categoryName = transaction.category.name;
    if (Object.prototype.hasOwnProperty.call(total, categoryName)) {
      total[categoryName] += transaction.amount;
    }
  }
  return total;
};

const getMonthIncome = (
  transactions: TransactionType[],
  month: string,
  year: number
): number => {
  const monthNumber = monthNameToNumber[month];
  if (!monthNumber) {
    return 0;
  }

  let income = 0;

  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  const relevantTransactions = processedTransactions.filter(
    (transaction) =>
      transaction.date.year === year && transaction.date.month === monthNumber
  );

  for (const transaction of relevantTransactions) {
    if (transaction.category.type === "Income") {
      income += transaction.amount;
    }
  }

  return income;
};

const getMonthExpenses = (
  transactions: TransactionType[],
  month: string,
  year: number
): number => {
  const monthNumber = monthNameToNumber[month];
  if (!monthNumber) {
    return 0;
  }

  let expenses = 0;

  const processedTransactions = transactions.map((transaction) => ({
    ...transaction,
    date: toPlainDate(transaction.date) as Temporal.PlainDate
  }));

  const relevantTransactions = processedTransactions.filter(
    (transaction) =>
      transaction.date.year === year && transaction.date.month === monthNumber
  );

  for (const transaction of relevantTransactions) {
    if (transaction.category.type === "Expense") {
      expenses += transaction.amount;
    }
  }

  return expenses;
};

export {
  getDayTransactions,
  getDayTotal,
  getMonthTotal,
  getDailyMonthTotals,
  getMonthlyTotalFromCategories,
  getYearlyTotalFromCategories,
  formatCurrency,
  getMonthIncome,
  getMonthExpenses
};
