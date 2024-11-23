import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserType, TransactionType } from "../../types";
import API_URL from "../../util/env";
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

  const categoryInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  const onExit = () => {
    navigate("/dashboard");
  };

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

    navigate("/dashboard");
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="512"
          height="512"
          viewBox="0 0 512 512"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M84.9407 448.942C78.6923 455.19 68.5616 455.19 62.3132 448.942C56.0649 442.693 56.0649 432.563 62.3132 426.314L233 255.628L62.3132 84.9417C56.0649 78.6933 56.0649 68.5626 62.3132 62.3142C68.5616 56.0658 78.6923 56.0658 84.9407 62.3142L255.627 233.001L426.313 62.3142C432.562 56.0658 442.692 56.0658 448.941 62.3142C455.189 68.5626 455.189 78.6933 448.941 84.9417L278.254 255.628L448.941 426.314C455.189 432.563 455.189 442.693 448.941 448.942C442.692 455.19 432.562 455.19 426.313 448.942L255.627 278.255L84.9407 448.942Z"
            fill="white"
          />
        </svg>
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
