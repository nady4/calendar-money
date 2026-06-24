import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Temporal } from "@js-temporal/polyfill";
import NavBar from "../../components/Dashboard/NavBar";
import Dropdown from "../../components/Dashboard/Dropdown";
import PeriodNavigator from "../../components/Stats/PeriodNavigator";
import { UserType, BudgetType } from "../../types";
import {
  getMonthCategoryBreakdown,
  getYearCategoryBreakdown,
  CategoryBreakdownItem,
  formatCurrency
} from "../../util/functions";
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget
} from "../../util/budgets";
import { months } from "../../util/constants";
import { toRgba } from "../../util/chartUtils";
import "../../styles/Budgets.scss";

interface BudgetsProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Budgets = ({
  user,
  setUser,
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen
}: BudgetsProps) => {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState("");

  useEffect(() => {
    setBudgets(getBudgets(user.id));
  }, [user.id]);

  const expenseCategories = useMemo(
    () => user.categories.filter((c) => c.type === "Expense"),
    [user.categories]
  );

  const breakdown = useMemo(() => {
    return period === "monthly"
      ? getMonthCategoryBreakdown(
          user.transactions,
          user.categories,
          months[selectedDay.month - 1],
          selectedDay.year
        )
      : getYearCategoryBreakdown(
          user.transactions,
          user.categories,
          selectedDay.year
        );
  }, [user.transactions, user.categories, selectedDay, period]);

  const spentByName = useMemo(() => {
    const map: { [name: string]: number } = {};
    breakdown.expenses.forEach((e: CategoryBreakdownItem) => {
      map[e.name] = e.total;
    });
    return map;
  }, [breakdown]);

  const periodBudgets = budgets.filter((b) => b.period === period);

  const canAdd =
    categoryId !== "" && limit !== "" && parseFloat(limit) > 0 && expenseCategories.find((c) => c._id === categoryId);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    const cat = expenseCategories.find((c) => c._id === categoryId);
    if (!cat) return;
    const budget: BudgetType = {
      id: uuidv4(),
      categoryId: cat._id,
      categoryName: cat.name,
      limit: parseFloat(limit),
      period
    };
    setBudgets(addBudget(user.id, budget));
    setCategoryId("");
    setLimit("");
  };

  const handleSaveEdit = (budget: BudgetType) => {
    if (!editLimit || parseFloat(editLimit) <= 0) return;
    const updated = { ...budget, limit: parseFloat(editLimit) };
    setBudgets(updateBudget(user.id, updated));
    setEditingId(null);
    setEditLimit("");
  };

  const handleDelete = (budget: BudgetType) => {
    setBudgets(deleteBudget(user.id, budget.id));
  };

  const categoryColor = (name: string) =>
    user.categories.find((c) => c.name === name)?.color || "rgb(91, 140, 255)";

  return (
    <div className="budgets-view">
      <Dropdown
        user={user}
        setUser={setUser}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />
      <NavBar
        user={user}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        isStatsView={true}
        setSelectedTransaction={() => {}}
      />

      <div className="budgets-container">
        <div className="budgets-header">
          <div>
            <h2 className="budgets-title">Budgets</h2>
            <p className="budgets-sub">{period}</p>
          </div>
          <PeriodNavigator
            scope={period === "monthly" ? "month" : "year"}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
          <div className="segmented">
            <button
              className={period === "monthly" ? "seg seg-active" : "seg"}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
            <button
              className={period === "yearly" ? "seg seg-active" : "seg"}
              onClick={() => setPeriod("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        {expenseCategories.length === 0 ? (
          <p className="budgets-empty">
            Add an expense category first to set budgets.
          </p>
        ) : (
          <form className="budget-form card" onSubmit={handleAdd}>
            <h3 className="card-title">New Budget</h3>
            <div className="budget-form-row">
              <label className="budget-field">
                <span className="budget-label">Category</span>
                <select
                  className="budget-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select category…</option>
                  {expenseCategories.map((c) => (
                    <option
                      key={c._id}
                      value={c._id}
                      disabled={periodBudgets.some(
                        (b) => b.categoryId === c._id
                      )}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="budget-field">
                <span className="budget-label">Limit ($)</span>
                <input
                  type="number"
                  className="budget-input"
                  min="0"
                  step="0.01"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="0.00"
                />
              </label>
              <button
                type="submit"
                className="budget-add-btn"
                disabled={!canAdd}
              >
                Add
              </button>
            </div>
          </form>
        )}

        <div className="budget-list">
          {periodBudgets.length === 0 ? (
            <p className="budgets-empty">No budgets for this period yet.</p>
          ) : (
            periodBudgets.map((b) => {
              const spent = spentByName[b.categoryName] || 0;
              const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
              const over = spent > b.limit;
              const remaining = b.limit - spent;
              const color = categoryColor(b.categoryName);

              return (
                <div key={b.id} className="budget-item card">
                  <div className="budget-item-head">
                    <span
                      className="budget-dot"
                      style={{ background: toRgba(color, 1) }}
                    />
                    <span className="budget-item-name">{b.categoryName}</span>
                    <span className="budget-limit">
                      Limit: ${formatCurrency(b.limit)}
                    </span>
                  </div>

                  {editingId === b.id ? (
                    <div className="budget-edit">
                      <input
                        type="number"
                        className="budget-input"
                        min="0"
                        step="0.01"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                      />
                      <button
                        className="budget-btn save"
                        onClick={() => handleSaveEdit(b)}
                      >
                        Save
                      </button>
                      <button
                        className="budget-btn"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="budget-progress">
                        <div className="budget-progress-track">
                          <div
                            className={`budget-progress-fill ${over ? "over" : ""}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="budget-progress-labels">
                          <span>
                            Spent ${formatCurrency(spent)}
                          </span>
                          <span className={over ? "over" : "ok"}>
                            {over
                              ? `Over by $${formatCurrency(-remaining)}`
                              : `$${formatCurrency(remaining)} left`}
                          </span>
                        </div>
                      </div>
                      <div className="budget-actions">
                        <button
                          className="budget-btn"
                          onClick={() => {
                            setEditingId(b.id);
                            setEditLimit(String(b.limit));
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="budget-btn danger"
                          onClick={() => handleDelete(b)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;