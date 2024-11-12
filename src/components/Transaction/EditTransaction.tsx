import React, { useState, useRef, useEffect } from "react";
import "../../styles/form.scss";
import API_URL from "../../util/env";

function EditTransaction({
  user,
  setUser,
  transaction,
  triggers,
  setTriggers,
}) {
  const [amount, setAmount] = useState(Math.abs(transaction.amount));
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState(transaction.category);

  const onAmountChange = (event) => {
    setAmount(parseFloat(event.target.value));
  };
  const onDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const categoryInput = useRef(null);
  const onCategoryChange = async (event) => {
    await setCategory(
      user.categories.find((category) => category.name === event.target.value)
    );
    categoryInput.current.placeholder = event.target.value;
    categoryInput.current.value = "";
  };
  const onExit = () => {
    setTriggers({ ...triggers, editTransaction: false });
  };

  const handleSubmit = () => {
    transaction.amount = amount;
    transaction.description = description;
    transaction.category = category;

    fetch(`${API_URL}/transactions/${user.username}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(transaction),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setUser({ ...user, transactions: data.transactions });
        }
      });

    setTriggers({ ...triggers, editTransaction: false });
  };

  const handleDeleteSubmit = () => {
    const newTransactions = user.transactions.filter(
      (tx) => tx.id !== transaction.id
    );

    fetch(`${API_URL}/transactions/${user.username}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        id: transaction.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setUser({ ...user, transactions: newTransactions });
        }
      });

    setTriggers({ ...triggers, editTransaction: false });
  };

  useEffect(() => {
    const categories = user.categories.map((c) => c.name);
    const datalist = document.getElementById("categories");
    categories.forEach((c) => {
      const option = document.createElement("option");
      option.value = c;
      datalist.appendChild(option);
    });
  }, [user.categories]);

  return (
    <div className="form">
      <h1>Edit Transaction</h1>
      <button className="exit-button" onClick={onExit}>
        X
      </button>
      <form id="edit-transaction-form">
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
          description="Description"
          value={description}
          onChange={onDescriptionChange}
        />

        <label htmlFor="category">Category</label>
        <input
          id="category-input"
          ref={categoryInput}
          description="Category"
          list="categories"
          onChange={onCategoryChange}
          placeholder={category.name}
        />
        <datalist id="categories"></datalist>

        <button type="submit" className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </form>
      <button className="delete-button-container" onClick={handleDeleteSubmit}>
        <p className="delete-button">Delete</p>
      </button>
    </div>
  );
}

export default EditTransaction;
