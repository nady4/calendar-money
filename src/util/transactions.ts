import moment from "moment";
import { TransactionType } from "../types.d";

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

const getTransactionsBalances = (transactions: TransactionType[]) => {
  transactions.sort((a, b) => {
    return moment(a.date).isAfter(b.date) ? 1 : -1;
  });

  let balance = 0;
  const balanceByDay: { [date: string]: number } = {};
  transactions.forEach((transaction) => {
    const lastDate = Object.keys(balanceByDay).pop();
    if (lastDate) {
      balance = balanceByDay[lastDate];
    }
    if (transaction.category.type === "Income") balance += transaction.amount;
    else balance -= transaction.amount;
    const date = moment(transaction.date).format("DD-MM-YYYY");
    balanceByDay[date] = balance;
  });
  return balanceByDay;
};

export { getTransactionsBalances, getTransactionsFromDay };
