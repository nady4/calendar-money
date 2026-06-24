import { Temporal } from "@js-temporal/polyfill";
import { UserType, TransactionType } from "../types";
import { API_URL } from "./api";

const updateTransactionDate = async (
  userId: string,
  transactionId: string,
  newDate: Temporal.PlainDate,
  token: string | null
): Promise<UserType | null> => {
  const date = new Date(newDate.year, newDate.month - 1, newDate.day);

  const response = await fetch(`${API_URL}/transactions/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: transactionId,
      date,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Error moving transaction:", data.error);
    return null;
  }
  return data.user as UserType;
};

const findTransaction = (
  transactions: TransactionType[],
  id: string
): TransactionType | undefined => transactions.find((t) => t._id === id);

const createTransaction = async (
  userId: string,
  payload: {
    date: Date;
    amount: number;
    description: string;
    category: string;
  },
  token: string | null
): Promise<UserType | null> => {
  const response = await fetch(`${API_URL}/transactions/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.error("Error creating transaction:", data?.error);
    return null;
  }

  const data = await response.json();
  return data.user as UserType;
};

const bulkImportTransactions = async (
  userId: string,
  payload: {
    categories?: Array<{
      _id?: string;
      name: string;
      type: string;
      color: string;
    }>;
    transactions: Array<{
      _id?: string;
      date: Date | string;
      amount: number;
      description: string;
      category: string;
      group?: string;
    }>;
  },
  token: string | null
): Promise<{ user: UserType | null; imported: { categories: number; transactions: number; skipped: number } | null; error: string | null }> => {
  const response = await fetch(`${API_URL}/transactions/bulk/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return {
      user: null,
      imported: null,
      error: data?.error || `Import failed (status ${response.status})`
    };
  }

  const data = await response.json();
  return {
    user: (data.user as UserType) || null,
    imported: data.imported || null,
    error: null
  };
};

export {
  updateTransactionDate,
  findTransaction,
  createTransaction,
  bulkImportTransactions
};