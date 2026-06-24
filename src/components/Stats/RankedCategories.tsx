import { CategoryBreakdownItem, formatCurrency } from "../../util/functions";
import { toRgba } from "../../util/chartUtils";

interface RankedCategoriesProps {
  breakdown: { income: CategoryBreakdownItem[]; expenses: CategoryBreakdownItem[] };
}

const RankedCategories = ({ breakdown }: RankedCategoriesProps) => {
  const totalExpenses = breakdown.expenses.reduce((s, i) => s + i.total, 0);
  const totalIncome = breakdown.income.reduce((s, i) => s + i.total, 0);

  const renderList = (
    list: CategoryBreakdownItem[],
    total: number,
    type: "Income" | "Expense"
  ) => {
    if (list.length === 0) {
      return (
        <p className="ranked-empty">
          No {type.toLowerCase()} categories in this period.
        </p>
      );
    }
    return (
      <ol className="ranked-list">
        {list.slice(0, 6).map((item, i) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          return (
            <li key={item.name} className="ranked-row">
              <span className="ranked-rank">{i + 1}</span>
              <span
                className="ranked-dot"
                style={{ background: toRgba(item.color, 1) }}
              />
              <span className="ranked-name">{item.name}</span>
              <div className="ranked-bar-track">
                <div
                  className={`ranked-bar-fill ${type === "Income" ? "positive" : "negative"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="ranked-amount">
                {type === "Income" ? "+" : "-"}${formatCurrency(item.total)}
              </span>
              <span className="ranked-pct">{pct.toFixed(1)}%</span>
            </li>
          );
        })}
      </ol>
    );
  };

  return (
    <div className="ranked-card card">
      <div className="ranked-section">
        <h3 className="ranked-title">Top Expenses</h3>
        {renderList(breakdown.expenses, totalExpenses, "Expense")}
      </div>
      <div className="ranked-divider" />
      <div className="ranked-section">
        <h3 className="ranked-title">Top Income Sources</h3>
        {renderList(breakdown.income, totalIncome, "Income")}
      </div>
    </div>
  );
};

export default RankedCategories;