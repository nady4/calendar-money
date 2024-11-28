import { TransactionType } from "../../types.d";
import "../../styles/Transaction.scss";

function Transaction({ transaction }: { transaction: TransactionType }) {
  return (
    <div
      className="transaction"
      style={{ border: "2px solid " + transaction.category.color }}
    >
      <div className="transaction-amount">
        {transaction.category.type === "Income" ? "+" : "-"}$
        {transaction.amount}
      </div>
      <div className="transaction-description">{transaction.description}</div>
    </div>
  );
}

export default Transaction;
