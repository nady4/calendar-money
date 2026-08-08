import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserType } from "../types";

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const txDateString = (value: unknown): string => {
  if (typeof value === "string") return value.split("T")[0];
  return String(value).split("T")[0];
};

const formatAmount = (amount: number, type: string): string => {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return type === "Income" ? `+$${formatted}` : `-$${formatted}`;
};

export const downloadBackupPdf = (user: UserType) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Calendar Money — Backup report", margin, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`User: ${user.username || "user"}`, margin, 66);
  doc.text(`Exported: ${formatDate(new Date())}`, margin, 80);

  const categories = user.categories || [];
  const transactions = (user.transactions || [])
    .slice()
    .sort(
      (a, b) =>
        txDateString(a.date).localeCompare(txDateString(b.date)) ||
        a._id.localeCompare(b._id)
    );

  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(
    `Categories (${categories.length})`,
    margin,
    categories.length ? 110 : 108
  );

  autoTable(doc, {
    startY: categories.length ? 118 : 114,
    margin: { left: margin, right: margin },
    head: [["Name", "Type", "Color"]],
    body: categories.map((c) => [c.name, c.type, c.color]),
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const color = String(data.cell.raw ?? "").trim();
        if (/^#[0-9a-fA-F]{6}$/.test(color)) {
          const hex = color.slice(1);
          const rgb: [number, number, number] = [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16)
          ];
          data.cell.styles.fillColor = rgb;
          data.cell.styles.textColor = 255;
          data.cell.styles.fontStyle = "bold";
        }
      }
    }
  });

  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const categoriesEndY =
    (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? 130;

  let tableStartY = categoriesEndY + 40;
  if (categories.length === 0) tableStartY = 100;

  doc.text(`Transactions (${transactions.length})`, margin, tableStartY);

  autoTable(doc, {
    startY: tableStartY + 12,
    margin: { left: margin, right: margin },
    head: [["Date", "Description", "Category", "Amount"]],
    body: transactions.map((t) => [
      txDateString(t.date),
      t.description,
      t.category?.name ?? "",
      formatAmount(t.amount, t.category?.type ?? "Expense")
    ]),
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 80 },
      3: { cellWidth: 100, halign: "right" }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const raw = String(data.cell.raw ?? "");
        data.cell.styles.textColor = raw.startsWith("+") ? [34, 139, 34] : [200, 60, 60];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        pageWidth - margin,
        pageHeight - 20,
        { align: "right" }
      );
    }
  });

  const totalIncome = transactions
    .filter((t) => t.category?.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.category?.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalsY =
    (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? tableStartY + 12;

  const balance = totalIncome - totalExpense;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(`Total income: ${formatAmount(totalIncome, "Income")}`, margin, totalsY + 32);
  doc.text(`Total expenses: ${formatAmount(totalExpense, "Expense")}`, margin, totalsY + 48);
  if (balance >= 0) doc.setTextColor(34, 139, 34);
  else doc.setTextColor(200, 60, 60);
  doc.text(
    `Balance: ${formatAmount(Math.abs(balance), balance >= 0 ? "Income" : "Expense")}`,
    margin,
    totalsY + 64
  );

  doc.setTextColor(30);
  doc.save(`backup-${user.username || "user"}-${formatDate(new Date())}.pdf`);
};
