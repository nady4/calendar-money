import { useState, useRef, useEffect } from "react";
import "../../styles/form.scss";
import API_URL from "../../util/env";
import { UserType, TransactionType } from "../../types";
import { useNavigate } from "react-router-dom";

interface EditTransactionProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  transaction: TransactionType;
}

function EditTransaction({ user, setUser, transaction }: EditTransactionProps) {
  const [amount, setAmount] = useState(Math.abs(transaction.amount));
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState(transaction.category);

  const navigate = useNavigate();
  const categoryInput = useRef<HTMLInputElement>(null);

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
      (cat) => cat.name === event.target.value
    );
    if (selectedCategory) {
      await setCategory(selectedCategory);
      if (categoryInput.current) {
        categoryInput.current.placeholder = event.target.value;
        categoryInput.current.value = "";
      }
    }
  };

  const onExit = () => navigate("/calendar");

  const handleSubmit = () => {
    transaction.amount = amount;
    transaction.description = description;
    transaction.category = category;

    fetch(`${API_URL}/transactions/${user.username}`, {
      method: "PUT",
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

    navigate("/calendar");
  };

  const handleDeleteSubmit = () => {
    const newTransactions = user.transactions.filter(
      (tx) => tx.id !== transaction.id
    );

    fetch(`${API_URL}/transactions/${user.username}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: transaction.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setUser({ ...user, transactions: newTransactions });
        }
      });

    navigate("/calendar");
  };

  useEffect(() => {
    const categories = user.categories.map((c) => c.name);
    const datalist = document.getElementById("categories");
    if (datalist) {
      categories.forEach((c) => {
        const option = document.createElement("option");
        option.value = c;
        datalist.appendChild(option);
      });
    }
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
        <datalist id="categories"></datalist>

        <button type="button" className="submit-button" onClick={handleSubmit}>
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
