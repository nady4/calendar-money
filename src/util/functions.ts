import { Temporal } from "@js-temporal/polyfill";
import { TransactionType, CategoryType, TotalType } from "../types";

const toPlainDate = (date: string | Temporal.PlainDate): Temporal.PlainDate => {
  if (typeof date === "string") {
    return Temporal.PlainDate.from(date.split("T")[0]);
  }
  return date;
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

const getDaysWithTransactionsTotal = (
  transactions: TransactionType[]
): {
  [date: string]: TotalType;
} => {
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

const getDailyMonthTotals = (
  transactions: TransactionType[],
  month: string,
  year: number
): TotalType[] => {
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  const dailyTotals: TotalType[] = Array(daysInMonth)
    .fill(null)
    .map(() => ({
      income: 0,
      expenses: 0,
      balance: 0,
    }));

  transactions.forEach((transaction) => {
    const transactionDate = toPlainDate(transaction.date);
    const transactionMonth = transactionDate.toLocaleString("en-US", {
      month: "long",
    });

    if (transactionMonth === month && transactionDate.year === year) {
      const dayIndex = transactionDate.day - 1;

      if (transaction.category.type === "Income") {
        dailyTotals[dayIndex].income += transaction.amount;
      } else {
        dailyTotals[dayIndex].expenses += transaction.amount;
      }

      dailyTotals[dayIndex].balance =
        dailyTotals[dayIndex].income - dailyTotals[dayIndex].expenses;
    }
  });

  let income = 0;
  let expenses = 0;

  return dailyTotals.map((daily) => {
    income += daily.income;
    expenses += daily.expenses;

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  });
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

const getMonthTotal = (
  transactions: TransactionType[],
  month: string,
  year: number
): TotalType => {
  const total: TotalType = {
    income: 0,
    expenses: 0,
    balance: 0,
  };

  for (const transaction of transactions) {
    const transactionDate = Temporal.PlainDate.from(
      transaction.date.toString().replace("Z", "")
    );
    const transactionMonth = transactionDate.toLocaleString("en-US", {
      month: "long",
    });

    if (transactionMonth == month && transactionDate.year == year) {
      if (transaction.category.type === "Income") {
        total.income += transaction.amount;
      } else {
        total.expenses += transaction.amount;
      }

      total.balance = total.income - total.expenses;
    }
  }

  return total;
};
const getMonthlyTotalFromCategories = (
  transactions: TransactionType[],
  categories: CategoryType[],
  month: string,
  year: number
): { [Category: string]: number } => {
  const total: { [Category: string]: number } = {};
  for (const category of categories) {
    total[category.name] = 0;
  }

  for (const transaction of transactions) {
    const transactionDate = Temporal.PlainDate.from(
      transaction.date.toString().replace("Z", "")
    );
    const transactionMonth = transactionDate.toLocaleString("en-US", {
      month: "long",
    });

    if (transactionMonth == month && transactionDate.year == year) {
      for (const category of categories) {
        if (category.name === transaction.category.name) {
          total[category.name] += transaction.amount;
        }
      }
    }
  }
  return total;
};

const getYearlyTotalFromCategories = (
  transactions: TransactionType[],
  categories: CategoryType[],
  year: number
): { [Category: string]: number } => {
  const total: { [Category: string]: number } = {};
  for (const category of categories) {
    total[category.name] = 0;
  }

  for (const transaction of transactions) {
    const transactionDate = Temporal.PlainDate.from(
      transaction.date.toString().replace("Z", "")
    );
    const transactionYear = transactionDate.year;

    if (transactionYear == year) {
      for (const category of categories) {
        if (category.name === transaction.category.name) {
          total[category.name] += transaction.amount;
        }
      }
    }
  }
  return total;
};

export {
  getDayTransactions,
  getDayTotal,
  getMonthTotal,
  getDailyMonthTotals,
  getMonthlyTotalFromCategories,
  getYearlyTotalFromCategories,
};
