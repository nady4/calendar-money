import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "../../styles/form.scss";
import API_URL from "../../util/env";

function NewTransaction({ user, setUser, day, triggers, setTriggers }) {
  const id = uuidv4();
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [categories, setCategories] = useState([]);
  const categoryInput = useRef(null);
  const categoriesDatalist = useRef(null);

  useEffect(() => {
    setCategories(user.categories);

    if (categoriesDatalist.current.children.length === 0) {
      categories.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.name;
        categoriesDatalist.current.appendChild(option);
      });
    }
  }, [categories, user.categories]);

  useEffect(() => {
    const isCategoryValid = categories.find(
      (c) => c.name === categoryInput.current.value
    );
    const isAmountValid = amount >= 0;
    const isDescriptionValid = description.length > 0;

    isCategoryValid && isAmountValid && isDescriptionValid
      ? setDisableSubmitButton(false)
      : setDisableSubmitButton(true);
  }, [amount, categories, category, description]);

  const onAmountChange = (event) => {
    if (
      event.target.value === "" ||
      !Number.isInteger(parseInt(event.target.value))
    ) {
      setAmount(0);
      return;
    }
    setAmount(parseFloat(event.target.value));
  };
  const onDescriptionChange = (event) => {
    setDescription(event.target.value);
  };
  const onCategoryChange = async (event) => {
    setCategory(event.target.value);
  };
  const onExit = () => {
    setTriggers({ ...triggers, newTransaction: false });
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

    setTriggers({ ...triggers, newTransaction: false });
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
          description="amount"
          value={amount}
          onChange={onAmountChange}
        />

        <label htmlFor="description">Description</label>
        <input
          type="text"
          description="description"
          value={description}
          onChange={onDescriptionChange}
        />

        <label htmlFor="category">Category</label>
        <input
          id="category-input"
          ref={categoryInput}
          description="Category"
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
