import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";
import API_URL from "../../util/env";
import exitButton from "../../styles/whiteExitButton.svg";
import useCategoryOptions from "../../hooks/useCategoryOptions";
import useValidateTransaction from "../../hooks/useValidateTransaction";
import "../../styles/form.scss";

interface NewTransactionProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  day: moment.Moment;
}

function NewTransaction({ user, setUser, day }: NewTransactionProps) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryType | null>(null);
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
        categoryInput.current.placeholder = event.target.value;
        categoryInput.current.value = "";
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newTransaction = {
      date: day.format(),
      amount,
      description,
      category: category ? category._id : null,
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
      <h1>New Transaction</h1>
      <button
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        <img src={exitButton} className="exit-button-logo" />
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
        <input
          id="category-input"
          ref={categoryInput}
          name="category"
          list="categories-datalist"
          onChange={onCategoryChange}
        />
        <datalist id="categories-datalist" ref={categoriesDatalist}></datalist>
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
