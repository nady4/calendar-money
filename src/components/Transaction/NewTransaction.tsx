import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "../../styles/form.scss";
import API_URL from "../../util/env";
import { Navigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";

interface NewTransactionProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  day: moment.Moment;
}

function NewTransaction({ user, setUser, day }: NewTransactionProps) {
  const id = uuidv4();
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const categoryInput = useRef<HTMLInputElement>(null);
  const categoriesDatalist = useRef<HTMLDataListElement>(null);

  useEffect(() => {
    setCategories(user.categories);

    if (
      categoriesDatalist.current &&
      categoriesDatalist.current.children.length === 0
    ) {
      categories.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.name;
        categoriesDatalist.current?.appendChild(option);
      });
    }
  }, [categories, user.categories]);

  useEffect(() => {
    const isCategoryValid =
      categoryInput.current &&
      categories.find((c) => c.name === categoryInput.current?.value);
    const isAmountValid = amount >= 0;
    const isDescriptionValid = description.length > 0;

    if (isCategoryValid && isAmountValid && isDescriptionValid)
      setDisableSubmitButton(false);
    else {
      setDisableSubmitButton(true);
    }
  }, [amount, categories, category, description]);

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
    const selectedCategory = categories.find(
      (c) => c.name === event.target.value
    );
    setCategory(selectedCategory || null);
  };

  const onExit = () => {
    return <Navigate to="/calendar" />;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const newTransaction = {
      date: day.format(),
      id,
      amount,
      description,
      category,
      token: localStorage.getItem("token"),
    };

    await fetch(`${API_URL}/transactions/${user.username}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTransaction),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setUser({ ...user, transactions: data.transactions });
        }
      });

    return <Navigate to="/calendar" />;
  };

  return (
    <div className="form">
      <h1>New Transaction</h1>
      <button className="exit-button" onClick={onExit}>
        X
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
