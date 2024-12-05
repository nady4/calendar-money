import { TransactionType } from "../../types.d";
import "../../styles/list-item.scss";

function Transaction({ transaction }: { transaction: TransactionType }) {
  return (
    <div className="item" style={{ background: transaction.category.color }}>
      <div className="transaction-amount">
        {transaction.category.type === "Income" ? "+" : "-"}$
        {transaction.amount}
      </div>
      <div className="transaction-description">{transaction.description}</div>
    </div>
  );
}

export default Transaction;
