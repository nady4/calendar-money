import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { UserType, CategoryType } from "../../types.d";
import API_URL from "../../util/api";
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
  const [repeats, setRepeats] = useState(false);
  const repeatsBox = useRef<HTMLInputElement>(null);
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

  const onRepeatsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepeats(event.target.checked);
  };

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
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      />
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
          className="category-input"
          ref={categoryInput}
          name="category"
          list="categories-datalist"
          onChange={onCategoryChange}
        />
        <datalist id="categories-datalist" ref={categoriesDatalist}></datalist>

        <label htmlFor="date">Date</label>
        <input
          type="date"
          name="date"
          id="date"
          onChange={onDateChange}
          value={selectedDay.toString().slice(0, 10)}
        />
        <div className="repeat-container">
          <label htmlFor="repeat">Repeat each Month</label>
          <input
            type="checkbox"
            name="repeat"
            id="repeat"
            ref={repeatsBox}
            onChange={onRepeatsChange}
          />
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
