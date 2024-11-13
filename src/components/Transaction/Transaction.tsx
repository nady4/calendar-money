import { useNavigate } from "react-router-dom";
import { TransactionType } from "../../types.d";
import "./Transaction.scss";

function Transaction({ transaction }: { transaction: TransactionType }) {
  const navigate = useNavigate();
  return (
    <div
      className="transaction"
      onClick={() => {
        //setTransaction(transaction);
        navigate("/edit-transaction");
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
