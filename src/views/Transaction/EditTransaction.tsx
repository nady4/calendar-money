import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { toast } from "react-toastify";
import { API_URL } from "../../util/api";
import useCategoryOptions from "../../hooks/useCategoryOptions";
import useValidateTransaction from "../../hooks/useValidateTransaction";
import { UserType, TransactionType } from "../../types";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";
import { formatCurrency, getDayTotal, getMonthTotal } from "../../util/functions";
import { months } from "../../util/constants";
import { toUserState } from "../../util/user";

interface EditTransactionProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  transaction: TransactionType;
}

function EditTransaction({ user, setUser, transaction }: EditTransactionProps) {
  const [amount, setAmount] = useState(Math.abs(transaction.amount));
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(
    Temporal.PlainDate.from(transaction.date.toString().slice(0, 10))
  );
  const [repeats, setRepeats] = useState<"weekly" | "monthly" | null>(
    transaction.repeat || null
  );
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesDatalist = useRef<HTMLDataListElement>(null);
  const categoryInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useCategoryOptions({ user, categoriesDatalist });
  useValidateTransaction({
    user,
    categoryInput,
    amount,
    description,
    category,
    setDisableSubmitButton,
  });

  const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value === "" ? 0 : parseFloat(event.target.value));
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const onCategoryChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedCategory = user.categories.find(
      (c) => c.name === event.target.value
    );
    if (selectedCategory) {
      await setCategory(selectedCategory);
      if (categoryInput.current) {
        categoryInput.current.placeholder = `${
          selectedCategory.type === "Income" ? "( + )" : "( - )"
        } ${event.target.value} `;
        categoryInput.current.value = "";
      }
    }
  };

  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      try {
        const parsedDate = Temporal.PlainDate.from(value);
        setDate(parsedDate);
      } catch (error) {
        console.error("Invalid date format:", error);
      }
    }
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFormError(null);

    const newTransaction = {
      id: transaction._id,
      date: new Date(date.year, date.month - 1, date.day),
      amount,
      description,
      category,
      repeats,
      group: transaction.group,
    };

    try {
      const response = await fetch(`${API_URL}/transactions/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newTransaction),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data?.error || "We couldn’t save this entry. Try again.");
        return;
      }

      setUser(toUserState(data.user));
      const savedTotal = getDayTotal(data.user.transactions, date);
      toast.success(
        `Saved. ${date.toLocaleString("en", {
          month: "long",
          day: "numeric"
        })} now ends at $${formatCurrency(savedTotal.balance)}.`
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating transaction:", error);
      setFormError("We couldn’t reach the calendar. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubmit = async (
    event: React.FormEvent | React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    if (isDeleting) return;
    setIsDeleting(true);
    setFormError(null);

    try {
      const response = await fetch(`${API_URL}/transactions/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: transaction._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data?.error || "We couldn’t remove this entry. Try again.");
        return;
      }

      setUser(toUserState(data.user));
      toast.success(
        transaction.group
          ? "Removed this repeating series from your calendar."
          : "Removed from your calendar."
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setFormError("We couldn’t reach the calendar. Check your connection and try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedMonth = months[date.month - 1];
  const withoutCurrent = user.transactions.filter((item) => item._id !== transaction._id);
  const currentDayTotal = getDayTotal(withoutCurrent, date);
  const currentMonthTotal = getMonthTotal(
    withoutCurrent,
    selectedMonth,
    date.year
  );
  const signedAmount = category?.type === "Income" ? amount : -amount;
  const projectedDayTotal = currentDayTotal.balance + signedAmount;
  const projectedMonthTotal = currentMonthTotal.balance + signedAmount;

  return (
    <div className="form">
      <p className="form-kicker">Keep your calendar honest</p>
      <h2>Change this entry</h2>
      <p className="form-intro">
        Update what happened or adjust what is coming next.
      </p>
      <button
        type="button"
         aria-label="Back to calendar"
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        <img src={exitButton} alt="" />
      </button>
      <form id="edit-transaction-form" onSubmit={handleUpdateSubmit}>
        <label htmlFor="amount">How much?</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          id="amount"
          name="amount"
          value={amount}
          onChange={onAmountChange}
        />

        <label htmlFor="description">What is it?</label>
        <input
          type="text"
          name="description"
          id="description"
          value={description}
          onChange={onDescriptionChange}
        />

        <label htmlFor="category">Where should it go?</label>
        <div className="category-field">
          <input
            className="category-input"
            ref={categoryInput}
            name="category"
            id="category"
            list="categories"
            onChange={onCategoryChange}
            placeholder={category?.name || ""}
          />
          {category && (
            <span
              className={`category-type-badge ${
                category.type === "Income" ? "is-income" : "is-expense"
              }`}
              title={`This is an ${category.type.toLowerCase()} category`}
            >
              <span className="category-type-dot" />
              {category.type === "Income" ? "Income" : "Expense"}
            </span>
          )}
        </div>
        <datalist id="categories" ref={categoriesDatalist}></datalist>

        <label htmlFor="date">When?</label>
        <input
          type="date"
          name="date"
          id="date"
          onChange={onDateChange}
          value={date.toString().slice(0, 10)}
        />
        <div className="repeat-container">
          <label className="repeat-label">Make it a pattern</label>
          <div className="repeat-options" role="radiogroup" aria-label="Repeat">
            {(
              [
                { value: null, label: "None" },
                { value: "weekly" as const, label: "Weekly" },
                { value: "monthly" as const, label: "Monthly" }
              ]
            ).map((opt) => (
              <label
                key={opt.label}
                className={`repeat-option ${
                  repeats === opt.value ? "is-active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="repeat"
                  value={opt.label}
                  checked={repeats === opt.value}
                  onChange={() => setRepeats(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          <p className="repeat-help">
            {transaction.group
              ? "This entry belongs to a repeating series. Saving changes the series."
              : "Repeating entries are saved as scheduled dates on your calendar."}
          </p>
        </div>
        <div className="transaction-impact" aria-live="polite">
          <span>After this entry</span>
          <strong>
            {date.toLocaleString("en", { month: "long", day: "numeric" })}: $
            {formatCurrency(projectedDayTotal)}
          </strong>
          <small>
            {selectedMonth} net: {projectedMonthTotal >= 0 ? "+" : "-"}$
            {formatCurrency(Math.abs(projectedMonthTotal))}
          </small>
        </div>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button
          type="submit"
          className="submit-button"
          disabled={disableSubmitButton || isSaving || isDeleting}
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </form>
      <div className={`delete-button ${deleteConfirm ? "is-confirming" : ""}`}>
        <button
          type="button"
          className="delete"
          onClick={handleDeleteSubmit}
          disabled={isDeleting}
        >
          {deleteConfirm
            ? transaction.group
              ? "Remove this repeating series"
              : "Confirm removal"
            : "Remove from calendar"}
        </button>
        {deleteConfirm && !isDeleting && (
          <button
            type="button"
            className="delete-cancel"
            onClick={() => setDeleteConfirm(false)}
          >
            Keep entry
          </button>
        )}
      </div>
    </div>
  );
}

export default EditTransaction;
