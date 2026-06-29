import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { UserType, CategoryType } from "../../types.d";
import { API_URL } from "../../util/api";
import useCategoryOptions from "../../hooks/useCategoryOptions";
import useValidateTransaction from "../../hooks/useValidateTransaction";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";

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
    if (
      event.target.value === "" ||
      !Number.isInteger(parseInt(event.target.value))
    ) {
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
        setNewCategoryError(data?.error || "Could not create category.");
        return;
      }

      setUser(data.user);
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
      setNewCategoryError("Could not create category.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const canCreateCategory =
    newCategoryName.trim().length > 3 && newCategoryType !== "";

  const handleSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

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
        console.error("Error creating transaction:", data.error);
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  return (
    <div className="form">
      <h2>New Transaction</h2>
      <button
        type="button"
        aria-label="Close"
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        <img src={exitButton} alt="" />
      </button>
      <form id="new-transaction-form">
        <label htmlFor="amount">Amount</label>
        <input
          type="text"
          name="amount"
          id="amount"
          value={amount}
          onChange={onAmountChange}
        />

        <label htmlFor="description">Description</label>
        <input
          type="text"
          name="description"
          id="description"
          value={description}
          onChange={onDescriptionChange}
        />

        <label htmlFor="category">Category</label>
        <div className="category-field">
          <input
            className="category-input"
            ref={categoryInput}
            name="category"
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

        <label htmlFor="date">Date</label>
        <input
          type="date"
          name="date"
          id="date"
          onChange={onDateChange}
          value={selectedDay.toString().slice(0, 10)}
        />
        <div className="repeat-container">
          <label className="repeat-label">Repeat</label>
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
        </div>

        <div className="submit-button-container">
          <button
            type="button"
            className="submit-button"
            disabled={disableSubmitButton}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewTransaction;
