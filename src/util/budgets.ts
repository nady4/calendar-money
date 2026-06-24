import { BudgetType } from "../types";

const budgetKey = (userId: string) => `budgets:${userId}`;

const getBudgets = (userId: string): BudgetType[] => {
  try {
    const raw = localStorage.getItem(budgetKey(userId));
    return raw ? (JSON.parse(raw) as BudgetType[]) : [];
  } catch {
    return [];
  }
};

const saveBudgets = (userId: string, budgets: BudgetType[]): void => {
  localStorage.setItem(budgetKey(userId), JSON.stringify(budgets));
};

const addBudget = (userId: string, budget: BudgetType): BudgetType[] => {
  const budgets = getBudgets(userId);
  const updated = [...budgets, budget];
  saveBudgets(userId, updated);
  return updated;
};

const updateBudget = (userId: string, budget: BudgetType): BudgetType[] => {
  const budgets = getBudgets(userId).map((b) =>
    b.id === budget.id ? budget : b
  );
  saveBudgets(userId, budgets);
  return budgets;
};

const deleteBudget = (userId: string, budgetId: string): BudgetType[] => {
  const budgets = getBudgets(userId).filter((b) => b.id !== budgetId);
  saveBudgets(userId, budgets);
  return budgets;
};

export { getBudgets, saveBudgets, addBudget, updateBudget, deleteBudget };