import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import API_URL from "../../util/api";
import useCategoryOptions from "../../hooks/useCategoryOptions";
import useValidateTransaction from "../../hooks/useValidateTransaction";
import { UserType, TransactionType } from "../../types";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";

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
  const [repeats, setRepeats] = useState(false);
  const repeatsBox = useRef<HTMLInputElement>(null);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);

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
        setDate(parsedDate);
      } catch (error) {
        console.error("Invalid date format:", error);
      }
    }
  };

  const onRepeatsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepeats(event.target.checked);
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newTransaction = {
      id: transaction._id,
      date: new Date(date.year, date.month - 1, date.day),
      amount,
      description,
      category,
      repeats,
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
        console.error("Error updating transaction:", data.error);
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDeleteSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

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
        console.error("Error deleting transaction:", data.error);
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="form">
      <h2>Edit Transaction</h2>
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      />
      <form id="edit-transaction-form">
        <label htmlFor="amount">Amount</label>
        <input
          type="text"
          name="amount"
          value={amount}
          onChange={onAmountChange}
        />

        <label htmlFor="description">Description</label>
        <input
          type="text"
          name="description"
          value={description}
          onChange={onDescriptionChange}
        />

        <label htmlFor="category">Category</label>
        <input
          className="category-input"
          ref={categoryInput}
          name="category"
          list="categories"
          onChange={onCategoryChange}
          placeholder={category?.name || ""}
        />
        <datalist id="categories" ref={categoriesDatalist}></datalist>

        <label htmlFor="date">Date</label>
        <input
          type="date"
          name="date"
          id="date"
          onChange={onDateChange}
          value={date.toString().slice(0, 10)}
        />
        {transaction.group ? (
          <div className="repeat-container">
            <label htmlFor="repeat">Apply to all months</label>
            <input
              type="checkbox"
              name="repeat"
              id="repeat"
              ref={repeatsBox}
              onChange={onRepeatsChange}
            />
          </div>
        ) : (
          ""
        )}
        <button
          type="button"
          className="submit-button"
          disabled={disableSubmitButton}
          onClick={handleUpdateSubmit}
        >
          Submit
        </button>
      </form>
      <div className="delete-button">
        <button className="delete" onClick={handleDeleteSubmit}>
          Delete Transaction
        </button>
      </div>
    </div>
  );
}

export default EditTransaction;
