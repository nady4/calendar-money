import { Temporal } from "@js-temporal/polyfill";
interface CategoryType {
  _id: string;
  name: string;
  type: string;
  color: string;
}

interface TransactionType {
  _id: string;
  amount: number;
  description: string;
  category: Category;
  date: Temporal.PlainDate;
  group?: string;
  repeat?: "weekly" | "monthly";
}

interface UserType {
  id: string;
  username: string;
  email: string;
  password: string;
  loggedIn: boolean;
  transactions: Transaction[];
  categories: Category[];
}

interface TotalType {
  income: number;
  expenses: number;
  balance: number;
}

interface BudgetType {
  id: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  period: "monthly" | "yearly";
}

interface ScannedTransactionDraft {
  date?: string;
  amount: number;
  description: string;
  categoryName: string;
  categoryType: "Income" | "Expense";
  color: string;
}

interface ScannedResult {
  date: string | null;
  transactions: ScannedTransactionDraft[];
}

export {
  CategoryType,
  TransactionType,
  UserType,
  TotalType,
  BudgetType,
  ScannedTransactionDraft,
  ScannedResult
};
