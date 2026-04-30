import { TransactionType } from "../../types.d";
import { formatCurrency } from "../../util/functions";
import "../../styles/list-item.scss";

function Transaction({ transaction }: { transaction: TransactionType }) {
  return (
    <div className="item" style={{ background: transaction.category.color }}>
      <div className="transaction-amount">
        {transaction.category.type === "Income" ? "+" : "-"}$
        {formatCurrency(transaction.amount)}
      </div>
      <div className="transaction-description">{transaction.description}</div>
    </div>
  );
}

export default Transaction;
