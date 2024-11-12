import moment from "moment";

const getTransactionsFromDay = (transactions, day) => {
  //filter transactions and sort them by date (ascendent)
  return transactions
    .filter((transaction) => moment(transaction.date).isSame(day.format()))
    .sort((a, b) => {
      return moment(a.date).isAfter(b.date) ? 1 : -1;
    });
};

//return a hash map with the transactions and its respective dates
const getTransactionsBalances = (transactions) => {
  //order transactions by its date, by default they are ordered by creation date
  transactions.sort((a, b) => {
    return moment(a.date).isAfter(b.date) ? 1 : -1;
  });

  let balance = 0;
  const balanceByDay = {};
  transactions.forEach((transaction) => {
    //get the balance of the last date in the hash table
    const lastDate = Object.keys(balanceByDay).pop();
    if (lastDate) {
      balance = balanceByDay[lastDate];
    }
    balance += transaction.amount;
    const date = moment(transaction.date).format("DD-MM-YYYY");
    balanceByDay[date] = balance;
  });
  return balanceByDay;
};

export { getTransactionsBalances, getTransactionsFromDay };
