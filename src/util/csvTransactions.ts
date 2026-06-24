import {
  TransactionType,
  CategoryType,
  UserType
} from "../types";

const CATEGORIES_HEADER = "_id,name,type,color";
const TRANSACTIONS_HEADER =
  "_id,date,amount,description,category,group";

const escapeField = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const parseCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
};

export interface CsvCategory {
  _id: string;
  name: string;
  type: string;
  color: string;
}

export interface CsvTransaction {
  _id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  group: string;
}

export interface ParsedBackup {
  categories: CsvCategory[];
  transactions: CsvTransaction[];
}

const userToCategories = (user: UserType): CsvCategory[] =>
  (user.categories || []).map((c) => ({
    _id: c._id,
    name: c.name,
    type: c.type,
    color: c.color
  }));

const userToTransactions = (user: UserType): CsvTransaction[] =>
  (user.transactions || []).map((t) => {
    const rawDate = t.date as unknown;
    const dateStr =
      typeof rawDate === "string"
        ? rawDate.split("T")[0]
        : (rawDate as { toString: () => string }).toString();
    return {
      _id: t._id,
      date: new Date(dateStr),
      amount: t.amount,
      description: t.description,
      category: t.category?._id ?? "",
      group: t.group ?? ""
    };
  });

const categoriesToCsv = (categories: CsvCategory[]): string => {
  const rows = [CATEGORIES_HEADER];
  for (const c of categories) {
    rows.push(
      [
        escapeField(c._id),
        escapeField(c.name),
        escapeField(c.type),
        escapeField(c.color)
      ].join(",")
    );
  }
  return rows.join("\n");
};

const transactionsToCsv = (transactions: CsvTransaction[]): string => {
  const rows = [TRANSACTIONS_HEADER];
  for (const t of transactions) {
    const rawDate = t.date as unknown;
    const dateStr =
      typeof rawDate === "string"
        ? rawDate.split("T")[0]
        : (rawDate as { toString: () => string }).toString();
    rows.push(
      [
        escapeField(t._id),
        escapeField(dateStr),
        escapeField(t.amount),
        escapeField(t.description),
        escapeField(t.category),
        escapeField(t.group)
      ].join(",")
    );
  }
  return rows.join("\n");
};

export const buildBackupCsv = (user: UserType): string => {
  const categories = userToCategories(user);
  const transactions = userToTransactions(user);
  return [
    "## categories",
    categoriesToCsv(categories),
    "## transactions",
    transactionsToCsv(transactions)
  ].join("\n");
};

export const downloadBackupCsv = (user: UserType) => {
  const csv = buildBackupCsv(user);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `backup-${user.username || "user"}-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseBackupCsv = (csv: string): ParsedBackup => {
  const lines = csv.split(/\r?\n/);
  const categories: CsvCategory[] = [];
  const transactions: CsvTransaction[] = [];

  type Section = "none" | "categories" | "transactions";
  let section: Section = "none";
  let catHeader: string[] = [];
  let txHeader: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine;
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === "## categories") {
      section = "categories";
      continue;
    }
    if (trimmed === "## transactions") {
      section = "transactions";
      continue;
    }

    const fields = parseCsvLine(line);

    if (section === "categories") {
      if (catHeader.length === 0) {
        catHeader = fields.map((h) => h.trim().toLowerCase());
        continue;
      }
      const idx = {
        _id: catHeader.indexOf("_id"),
        name: catHeader.indexOf("name"),
        type: catHeader.indexOf("type"),
        color: catHeader.indexOf("color")
      };
      const name = idx.name >= 0 ? fields[idx.name]?.trim() : "";
      const type = idx.type >= 0 ? fields[idx.type]?.trim() : "";
      const color = idx.color >= 0 ? fields[idx.color]?.trim() : "";
      if (!name || !type || !color) continue;
      categories.push({
        _id: idx._id >= 0 ? fields[idx._id]?.trim() || "" : "",
        name,
        type,
        color
      });
    } else if (section === "transactions") {
      if (txHeader.length === 0) {
        txHeader = fields.map((h) => h.trim().toLowerCase());
        continue;
      }
      const idx = {
        _id: txHeader.indexOf("_id"),
        date: txHeader.indexOf("date"),
        amount: txHeader.indexOf("amount"),
        description: txHeader.indexOf("description"),
        category: txHeader.indexOf("category"),
        group: txHeader.indexOf("group")
      };
      if (idx.date === -1 || idx.amount === -1 || idx.description === -1) continue;
      const dateStr = fields[idx.date]?.trim() ?? "";
      const amountStr = fields[idx.amount]?.trim() ?? "";
      const description = fields[idx.description]?.trim() ?? "";
      const category =
        idx.category === -1 ? "" : fields[idx.category]?.trim() ?? "";
      const group = idx.group === -1 ? "" : fields[idx.group]?.trim() ?? "";
      if (!dateStr || !description) continue;

      let date: Date | null = null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split("-").map(Number);
        if (y && m && d) date = new Date(y, m - 1, d);
      } else {
        const parsed = new Date(dateStr);
        if (!Number.isNaN(parsed.getTime())) date = parsed;
      }
      if (!date) continue;
      const amount = parseFloat(amountStr);
      if (Number.isNaN(amount)) continue;

      transactions.push({
        _id: idx._id >= 0 ? fields[idx._id]?.trim() || "" : "",
        date,
        amount,
        description,
        category,
        group
      });
    }
  }

  return { categories, transactions };
};

export const transactionsOnlyToCsv = (
  transactions: TransactionType[]
): string => {
  const txs = transactions.map((t) => ({
    _id: t._id,
    date: (() => {
      const rawDate = t.date as unknown;
      if (typeof rawDate === "string") return new Date(rawDate);
      return rawDate as Date;
    })(),
    amount: t.amount,
    description: t.description,
    category: t.category?._id ?? "",
    group: t.group ?? ""
  }));
  return transactionsToCsv(txs);
};

export const categoryToCsv = (category: CategoryType): string =>
  categoriesToCsv([
    {
      _id: category._id,
      name: category.name,
      type: category.type,
      color: category.color
    }
  ]);