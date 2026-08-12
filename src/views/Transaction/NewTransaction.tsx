import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { toast } from "react-toastify";
import { UserType, CategoryType } from "../../types.d";
import { API_URL } from "../../util/api";
import useCategoryOptions from "../../hooks/useCategoryOptions";
import useValidateTransaction from "../../hooks/useValidateTransaction";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";
import {
  formatCurrency,
  getDayTotal,
  getMonthTotal
} from "../../util/functions";
import { months } from "../../util/constants";
import { toUserState } from "../../util/user";

interface NewTransactionProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
}

function NewTransaction({
  user,
  setUser,
  selectedDay,
  setSelectedDay,
}: NewTransactionProps) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const categoriesDatalist = useRef<HTMLDataListElement>(null);
  const categoryInput = useRef<HTMLInputElement>(null);
  const [repeats, setRepeats] = useState<"weekly" | "monthly" | null>(null);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"Income" | "Expense" | "">("");
  const [newCategoryColor, setNewCategoryColor] = useState("#5b8cff");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    if (event.target.value === "") {
      setAmount(0);
      return;
    }
    setAmount(parseFloat(event.target.value));
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
        setSelectedDay(parsedDate);
      } catch (error) {
        console.error("Invalid date format:", error);
      }
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
    if (!newCategoryName || !newCategoryType) return;
    if (
      user.categories.some(
        (c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
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
        setNewCategoryError(data?.error || "We couldn’t create that category.");
        return;
      }

       setUser(toUserState(data.user));
      const created = (data.user as UserType).categories.find(
        (c) => c.name === newCategoryName.trim()
      );
      if (created) {
        setCategory(created);
        if (categoryInput.current) {
          categoryInput.current.placeholder = `${
            created.type === "Income" ? "( + )" : "( - )"
          } ${created.name} `;
          categoryInput.current.value = "";
        }
      }

      resetNewCategoryForm();
      setShowNewCategory(false);
    } catch (error) {
      console.error("Error creating category:", error);
      setNewCategoryError("We couldn’t create that category. Try again.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const canCreateCategory =
    newCategoryName.trim().length > 3 && newCategoryType !== "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFormError(null);

    const newTransaction = {
      date: new Date(selectedDay.year, selectedDay.month - 1, selectedDay.day),
      amount,
      description,
      category: category ? category._id : null,
      repeats,
    };

    try {
      const response = await fetch(`${API_URL}/transactions/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newTransaction),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data?.error || "We couldn’t add this entry. Try again.");
        return;
      }

      setUser(toUserState(data.user));
      const savedTotal = getDayTotal(data.user.transactions, selectedDay);
      toast.success(
        `Added. ${selectedDay.toLocaleString("en", {
          month: "long",
          day: "numeric"
        })} now ends at $${formatCurrency(savedTotal.balance)}.`
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating transaction:", error);
      setFormError("We couldn’t reach the calendar. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedMonth = months[selectedDay.month - 1];
  const currentDayTotal = getDayTotal(user.transactions, selectedDay);
  const currentMonthTotal = getMonthTotal(
    user.transactions,
    selectedMonth,
    selectedDay.year
  );
  const signedAmount =
    category?.type === "Income"
      ? amount
      : category?.type === "Expense"
        ? -amount
        : 0;
  const projectedDayTotal = currentDayTotal.balance + signedAmount;
  const projectedMonthTotal = currentMonthTotal.balance + signedAmount;

  return (
    <div className="form">
      <p className="form-kicker">Tell your calendar what happened</p>
      <h2>Add to your calendar</h2>
      <p className="form-intro">
        Add something you paid, received, or already know is coming.
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
      <form id="new-transaction-form" onSubmit={handleSubmit}>
        <label htmlFor="amount">How much?</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          name="amount"
          id="amount"
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
        {user.categories.length === 0 && (
          <div className="form-empty-hint">
            <span>Your calendar needs a category before it can add an entry.</span>
            <button type="button" onClick={() => navigate("/new-category")}>
              Add a category first
            </button>
          </div>
        )}
        <div className="category-field">
          <input
            className="category-input"
            ref={categoryInput}
            name="category"
            id="category"
            list="categories-datalist"
            onChange={onCategoryChange}
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
        <datalist id="categories-datalist" ref={categoriesDatalist}></datalist>

        <div className="new-category-toggle-row">
          <button
            type="button"
            className="new-category-toggle"
            onClick={handleToggleNewCategory}
            aria-expanded={showNewCategory}
          >
            {showNewCategory ? "× Cancel" : "+ New category"}
          </button>
        </div>

        {showNewCategory && (
          <div className="new-category-inline">
            <label htmlFor="new-category-name" className="label">
              Category name
            </label>
            <input
              type="text"
              id="new-category-name"
              className="input"
              name="new-category-name"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setNewCategoryError(null);
              }}
              placeholder="e.g. Groceries"
              maxLength={32}
              autoFocus
            />

            <label className="label">Type</label>
            <div className="type-boxes">
              <label
                htmlFor="new-category-income"
                className={`type-option is-income ${
                  newCategoryType === "Income" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="new-category-type"
                  id="new-category-income"
                  checked={newCategoryType === "Income"}
                  onChange={() => {
                    setNewCategoryType("Income");
                    setNewCategoryError(null);
                  }}
                />
                <span>Income</span>
              </label>
              <label
                htmlFor="new-category-expense"
                className={`type-option is-expense ${
                  newCategoryType === "Expense" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="new-category-type"
                  id="new-category-expense"
                  checked={newCategoryType === "Expense"}
                  onChange={() => {
                    setNewCategoryType("Expense");
                    setNewCategoryError(null);
                  }}
                />
                <span>Expense</span>
              </label>
            </div>

            <label htmlFor="new-category-color" className="label">
              Color
            </label>
            <div className="new-category-color-row">
              <input
                type="color"
                id="new-category-color"
                className="new-category-color-input"
                name="new-category-color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
              />
              <div className="new-category-color-swatches">
                {[
                  "#5b8cff",
                  "#22c55e",
                  "#ef4444",
                  "#f59e0b",
                  "#a855f7",
                  "#06b6d4",
                  "#ec4899",
                  "#94a3b8"
                ].map((c) => (
                  <button
                    type="button"
                    key={c}
                    aria-label={`Pick color ${c}`}
                    className={`new-category-swatch ${
                      newCategoryColor === c ? "is-active" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewCategoryColor(c)}
                  />
                ))}
              </div>
            </div>

            {newCategoryError && (
              <p className="new-category-error" role="alert">
                {newCategoryError}
              </p>
            )}

            <button
              type="button"
              className="submit-button"
              disabled={!canCreateCategory || isCreatingCategory}
              onClick={handleCreateCategory}
            >
              {isCreatingCategory ? "Creating…" : "Create category"}
            </button>
          </div>
        )}

        <label htmlFor="date">When?</label>
        <input
          type="date"
          name="date"
          id="date"
          onChange={onDateChange}
          value={selectedDay.toString().slice(0, 10)}
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
            Repeating entries will appear on their scheduled dates.
          </p>
        </div>

        {category && amount > 0 && (
          <div className="transaction-impact" aria-live="polite">
            <span>After this entry</span>
            <strong>
              {selectedDay.toLocaleString("en", { month: "long", day: "numeric" })}: $
              {formatCurrency(projectedDayTotal)}
            </strong>
            <small>
              {selectedMonth} net: {projectedMonthTotal >= 0 ? "+" : "-"}$
              {formatCurrency(Math.abs(projectedMonthTotal))}
            </small>
          </div>
        )}

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="submit-button-container">
          <button
            type="submit"
            className="submit-button"
            disabled={disableSubmitButton || isSaving}
          >
            {isSaving ? "Adding…" : "Add entry"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewTransaction;
