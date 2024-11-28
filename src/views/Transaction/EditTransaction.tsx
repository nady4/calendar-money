import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
        categoryInput.current.placeholder = event.target.value;
        categoryInput.current.value = "";
      }
    }
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newTransaction = {
      id: transaction._id,
      date: transaction.date,
      amount,
      description,
      category,
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
          id="category-input"
          ref={categoryInput}
          name="category"
          list="categories"
          onChange={onCategoryChange}
          placeholder={category?.name || ""}
        />
        <datalist id="categories" ref={categoriesDatalist}></datalist>

        <button
          type="button"
          className="submit-button"
          disabled={disableSubmitButton}
          onClick={handleUpdateSubmit}
        >
          Submit
        </button>
      </form>
      <div className="link-button">
        <button className="link" onClick={handleDeleteSubmit}>
          Delete Transaction
        </button>
      </div>
    </div>
  );
}

export default EditTransaction;
