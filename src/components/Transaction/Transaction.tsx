import { Navigate } from "react-router-dom";
import { TransactionType } from "../../types.d";
import "./Transaction.scss";

function Transaction({ transaction }: { transaction: TransactionType }) {
  return (
    <div
      className="transaction"
      onClick={() => {
        //setTransaction(transaction);
        <Navigate to="/edit-transaction" />;
      }}
      style={{ backgroundColor: transaction.category.color }}
    >
      <div className="transaction-amount">{transaction.amount}</div>
      <div className="transaction-description">{transaction.description}</div>
      <div className="transaction-category">{transaction.category.name}</div>
    </div>
  );
}

export default Transaction;
