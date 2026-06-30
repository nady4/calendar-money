import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuid } from "uuid";
import { CategoryType, ScannedResult, UserType } from "../../types";
import {
  extractTransactionsFromImage,
  normalizeRowsForBulk,
} from "../../util/scanApi";
import { bulkImportTransactions } from "../../util/transactionApi";
import { API_URL } from "../../util/api";
import useCategoryOptions from "../../hooks/useCategoryOptions";
import {
  clearHeldImage,
  getHeldImage,
} from "../../util/scannedImageHolder";
import exitButton from "../../assets/whiteExitButton.svg";
import CloseIcon from "@mui/icons-material/Close";
import "../../styles/ScanReview.scss";

interface ScanReviewProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

interface ReviewRow {
  id: string;
  description: string;
  amount: number;
  date: string;
  hadOwnDate: boolean;
  categoryName: string;
  categoryType: "Income" | "Expense";
  color: string;
}

const todayString = () => Temporal.Now.plainDate("gregory").toString();

const buildRows = (result: ScannedResult): ReviewRow[] =>
  result.transactions.map((t) => {
    const globalDate = result.date || todayString();
    return {
      id: uuid(),
      description: t.description,
      amount: t.amount,
      date: t.date || globalDate,
      hadOwnDate: Boolean(t.date),
      categoryName: t.categoryName,
      categoryType: t.categoryType,
      color: t.color,
    };
  });

const resolveCategory = (
  user: UserType,
  name: string
): CategoryType | undefined =>
  user.categories.find(
    (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

function ScanReview({ user, setUser }: ScanReviewProps) {
  const navigate = useNavigate();
  const heldImage = getHeldImage();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(Boolean(heldImage));
  const [error, setError] = useState<string | null>(null);
  const [receiptDate, setReceiptDate] = useState(todayString());
  const [applyDateToUndated, setApplyDateToUndated] = useState(true);
  const [bulkStatus, setBulkStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"Income" | "Expense" | "">(
    ""
  );
  const [newCategoryColor, setNewCategoryColor] = useState("#5b8cff");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);

  const categoriesDatalist = useRef<HTMLDataListElement>(null);
  useCategoryOptions({ user, categoriesDatalist });

  useEffect(() => {
    if (!heldImage) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { result: scanned, error: scanError } =
        await extractTransactionsFromImage(
          user.id,
          heldImage,
          localStorage.getItem("token"),
          { existingCategoryNames: user.categories.map((c) => c.name) }
        );
      if (cancelled) return;
      if (scanError || !scanned) {
        setError(scanError || "Could not read the invoice.");
        setLoading(false);
        return;
      }
      setReceiptDate(scanned.date || todayString());
      setRows(buildRows(scanned));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id, user.categories, heldImage]);

  useEffect(() => {
    if (!applyDateToUndated) return;
    setRows((prev) =>
      prev.map((row) =>
        row.hadOwnDate ? row : { ...row, date: receiptDate }
      )
    );
  }, [receiptDate, applyDateToUndated]);

  const updateRow = (id: string, patch: Partial<ReviewRow>) =>
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );

  const resolveRowCategory = (row: ReviewRow) =>
    resolveCategory(user, row.categoryName);

  const rowHasNewCategory = (row: ReviewRow) =>
    !resolveCategory(user, row.categoryName) && row.categoryName.trim() !== "";

  const isRowValid = (row: ReviewRow) => {
    const amountOk = row.amount > 0;
    const descOk = row.description.trim() !== "";
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(row.date);
    const catOk = resolveRowCategory(row) || row.categoryName.trim() !== "";
    return amountOk && descOk && dateOk && catOk;
  };

  const invalidCount = useMemo(
    () =>
      rows.filter((row) => {
        const amountOk = row.amount > 0;
        const descOk = row.description.trim() !== "";
        const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(row.date);
        const catOk =
          resolveCategory(user, row.categoryName) ||
          row.categoryName.trim() !== "";
        return !(amountOk && descOk && dateOk && catOk);
      }).length,
    [rows, user]
  );
  const canSubmit = rows.length > 0 && invalidCount === 0;

  if (!heldImage) {
    return <Navigate to="/dashboard" />;
  }

  const handleDeleteRow = (id: string) =>
    setRows((prev) => prev.filter((row) => row.id !== id));

  const handleCategoryChange = (row: ReviewRow, value: string) => {
    const existing = user.categories.find(
      (c) => c.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    if (existing) {
      updateRow(row.id, {
        categoryName: existing.name,
        categoryType: existing.type as "Income" | "Expense",
        color: existing.color,
      });
    } else {
      updateRow(row.id, { categoryName: value });
    }
  };

  const resetNewCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryType("");
    setNewCategoryColor("#5b8cff");
    setNewCategoryError(null);
  };

  const handleToggleNewCategory = () => {
    setShowNewCategory((prev) => {
      if (prev) resetNewCategoryForm();
      return !prev;
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryType) return;
    if (
      user.categories.some(
        (c) =>
          c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      setNewCategoryError("A category with that name already exists.");
      return;
    }

    setIsCreatingCategory(true);
    setNewCategoryError(null);

    try {
      const response = await fetch(`${API_URL}/categories/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          type: newCategoryType,
          color: newCategoryColor,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setNewCategoryError(data?.error || "Could not create category.");
        return;
      }

      setUser(data.user);
      setRows((prev) =>
        prev.map((row) => {
          const match =
            row.categoryName.trim().toLowerCase() ===
            newCategoryName.trim().toLowerCase();
          if (!match) return row;
          const created = (data.user as UserType).categories.find(
            (c: { name: string }) => c.name === newCategoryName.trim()
          ) as CategoryType | undefined;
          return created
            ? {
                ...row,
                categoryName: created.name,
                categoryType: created.type as "Income" | "Expense",
                color: created.color,
              }
            : row;
        })
      );

      resetNewCategoryForm();
      setShowNewCategory(false);
    } catch (err) {
      console.error("Error creating category:", err);
      setNewCategoryError("Could not create category.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const canCreateCategory =
    newCategoryName.trim().length > 3 && newCategoryType !== "";

  const handleAddAll = async () => {
    if (!canSubmit) return;
    setBulkStatus({ type: "loading", message: "Adding transactions..." });
    const normalized = normalizeRowsForBulk(
      rows.map((row) => {
        const existing = resolveRowCategory(row);
        return {
          date: row.date,
          amount: row.amount,
          description: row.description,
          categoryId: existing ? existing._id : null,
          categoryName: row.categoryName,
          categoryType: existing
            ? (existing.type as "Income" | "Expense")
            : row.categoryType,
          color: row.color,
        };
      })
    );

    const resultBulk = await bulkImportTransactions(
      user.id,
      normalized,
      localStorage.getItem("token")
    );

    if (resultBulk.error) {
      setBulkStatus({ type: "error", message: resultBulk.error });
      toast.error(resultBulk.error, { theme: "dark" });
      return;
    }

    if (resultBulk.user) setUser(resultBulk.user);
    const imported = resultBulk.imported;
    const message = imported
      ? `Added ${imported.transactions} transaction${
          imported.transactions === 1 ? "" : "s"
        }${
          imported.categories > 0
            ? ` (and ${imported.categories} new categor${
                imported.categories === 1 ? "y" : "ies"
              })`
            : ""
        }.`
      : "Transactions added.";
    clearHeldImage();
    toast.success(message, { theme: "dark" });
    navigate("/dashboard");
  };

  const toastConfig = {
    position: "bottom-center" as const,
    autoClose: 3000,
    theme: "dark" as const,
  };

  return (
    <div className="scan-review">
      <ToastContainer {...toastConfig} />
      <h2>Review scanned transactions</h2>
      <button
        type="button"
        aria-label="Close"
        className="exit-button"
        onClick={() => {
          clearHeldImage();
          navigate("/dashboard");
        }}
      >
        <img src={exitButton} alt="" />
      </button>

      {loading && (
        <div className="loading" role="status" aria-live="polite">
          <div className="loading-card">
            <img src="/favicon.svg" alt="" className="loading-icon" />
            <p className="loading-label">Reading your invoice</p>
            <div className="loading-bar" aria-hidden>
              <span />
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="scan-review-error">
          <p>{error}</p>
          <button
            type="button"
            className="submit-button"
            onClick={() => {
              clearHeldImage();
              navigate("/dashboard");
            }}
          >
            Back to dashboard
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="scan-review-error">
          <p>No transactions were detected on this invoice.</p>
          <button
            type="button"
            className="submit-button"
            onClick={() => {
              clearHeldImage();
              navigate("/dashboard");
            }}
          >
            Back to dashboard
          </button>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="scan-review-body">
          <div className="scan-review-options">
            <label className="receipt-date-label">
              <span>Receipt date</span>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
              />
            </label>
            <label className="receipt-date-toggle">
              <input
                type="checkbox"
                checked={applyDateToUndated}
                onChange={(e) => setApplyDateToUndated(e.target.checked)}
              />
              <span>Apply this date to rows missing a date</span>
            </label>
            <button
              type="button"
              className="add-category-toggle"
              onClick={handleToggleNewCategory}
              aria-expanded={showNewCategory}
            >
              {showNewCategory ? "× Cancel" : "+ New category"}
            </button>
          </div>

          {showNewCategory && (
            <div className="scan-new-category-inline">
              <label className="nc-label">
                Category name
                <input
                  type="text"
                  className="nc-input"
                  value={newCategoryName}
                  maxLength={32}
                  autoFocus
                  placeholder="e.g. Groceries"
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setNewCategoryError(null);
                  }}
                />
              </label>

              <label className="nc-label">Type</label>
              <div className="nc-type-boxes">
                <label
                  className={`nc-type-option is-income ${
                    newCategoryType === "Income" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="scan-new-category-type"
                    checked={newCategoryType === "Income"}
                    onChange={() => {
                      setNewCategoryType("Income");
                      setNewCategoryError(null);
                    }}
                  />
                  <span>Income</span>
                </label>
                <label
                  className={`nc-type-option is-expense ${
                    newCategoryType === "Expense" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="scan-new-category-type"
                    checked={newCategoryType === "Expense"}
                    onChange={() => {
                      setNewCategoryType("Expense");
                      setNewCategoryError(null);
                    }}
                  />
                  <span>Expense</span>
                </label>
              </div>

              <label className="nc-label">Color</label>
              <div className="nc-color-row">
                <input
                  type="color"
                  className="nc-color-input"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                />
                <div className="nc-color-swatches">
                  {[
                    "#5b8cff", "#22c55e", "#ef4444", "#f59e0b",
                    "#a855f7", "#06b6d4", "#ec4899", "#94a3b8",
                  ].map((c) => (
                    <button
                      type="button"
                      key={c}
                      aria-label={`Pick color ${c}`}
                      className={`nc-swatch ${
                        newCategoryColor === c ? "is-active" : ""
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setNewCategoryColor(c)}
                    />
                  ))}
                </div>
              </div>

              {newCategoryError && (
                <p className="nc-error" role="alert">
                  {newCategoryError}
                </p>
              )}

              <button
                type="button"
                className="submit-button nc-submit"
                disabled={!canCreateCategory || isCreatingCategory}
                onClick={handleCreateCategory}
              >
                {isCreatingCategory ? "Creating…" : "Create category"}
              </button>
            </div>
          )}

          <div className="scan-review-table">
            <div className="scan-review-row scan-review-header">
              <div>Description</div>
              <div>Amount</div>
              <div>Date</div>
              <div>Category</div>
              <div />
            </div>

            {rows.map((row) => {
              const existing = resolveRowCategory(row);
              const isNew = rowHasNewCategory(row);
              const valid = isRowValid(row);
              const typeIsIncome =
                (existing ? existing.type : row.categoryType) === "Income";
              return (
                <div
                  key={row.id}
                  className={`scan-review-row ${
                    valid ? "" : "is-invalid"
                  } ${isNew ? "is-new-category" : ""}`}
                >
                  <input
                    className="cell cell-description"
                    type="text"
                    value={row.description}
                    placeholder="Description"
                    onChange={(e) =>
                      updateRow(row.id, { description: e.target.value })
                    }
                  />
                  <input
                    className="cell cell-amount"
                    type="text"
                    inputMode="decimal"
                    value={row.amount}
                    placeholder="0"
                    onChange={(e) => {
                      const parsed = parseFloat(e.target.value);
                      updateRow(row.id, {
                        amount: Number.isFinite(parsed) ? parsed : 0,
                      });
                    }}
                  />
                  <input
                    className="cell cell-date"
                    type="date"
                    value={row.date}
                    onChange={(e) =>
                      updateRow(row.id, { date: e.target.value, hadOwnDate: true })
                    }
                  />
                  <div className="cell cell-category">
                    <div className="category-main">
                      <input
                        className={`category-input ${
                          !row.categoryName.trim() ? "is-missing" : ""
                        }`}
                        list="scan-categories-datalist"
                        value={row.categoryName}
                        placeholder="Category"
                        onChange={(e) =>
                          handleCategoryChange(row, e.target.value)
                        }
                      />
                      {existing && (
                        <span
                          className={`category-type-badge ${
                            typeIsIncome ? "is-income" : "is-expense"
                          }`}
                        >
                          <span className="category-type-dot" />
                          {existing.type}
                        </span>
                      )}
                    </div>
                    {isNew && (
                      <div className="category-new-controls">
                        <button
                          type="button"
                          className={`type-pill is-income ${
                            row.categoryType === "Income" ? "is-selected" : ""
                          }`}
                          onClick={() =>
                            updateRow(row.id, { categoryType: "Income" })
                          }
                          title="Income"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className={`type-pill is-expense ${
                            row.categoryType === "Expense" ? "is-selected" : ""
                          }`}
                          onClick={() =>
                            updateRow(row.id, { categoryType: "Expense" })
                          }
                          title="Expense"
                        >
                          −
                        </button>
                        <input
                          type="color"
                          className="type-color"
                          value={row.color}
                          title="Category color"
                          onChange={(e) =>
                            updateRow(row.id, { color: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Remove row"
                    className="row-delete"
                    onClick={() => handleDeleteRow(row.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              );
            })}
          </div>

          <datalist id="scan-categories-datalist" ref={categoriesDatalist} />

          <div className="scan-review-actions">
            {bulkStatus.type === "error" && (
              <p className="scan-status scan-status-error">
                {bulkStatus.message}
              </p>
            )}
            {invalidCount > 0 && (
              <p className="scan-status scan-status-warning">
                {invalidCount} row{invalidCount === 1 ? "" : "s"} need{" "}
                {invalidCount === 1 ? "" : " "}fixing before adding
              </p>
            )}
            <button
              type="button"
              className="submit-button"
              disabled={!canSubmit || bulkStatus.type === "loading"}
              onClick={handleAddAll}
            >
              {bulkStatus.type === "loading"
                ? "Adding..."
                : `Add all (${rows.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanReview;