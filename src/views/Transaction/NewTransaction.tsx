import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";
import API_URL from "../../util/env";
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
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const categoryInput = useRef<HTMLInputElement>(null);
  const categoriesDatalist = useRef<HTMLDataListElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCategories(user.categories);

    if (categoriesDatalist.current) {
      categoriesDatalist.current.innerHTML = ""; // Limpia opciones existentes
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

  const onCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedCategory = categories.find(
      (c) => c.name === event.target.value
    );
    if (!selectedCategory) {
      console.error("Invalid category selected");
    }
    setCategory(selectedCategory || null);
  };

  const onExit = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newTransaction = {
      date: day.format(),
      amount,
      description,
      category: category ? category._id : null,
    };

    console.log(newTransaction);

    try {
      const response = await fetch(`${API_URL}/user/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          transactions: [...(user.transactions || []), newTransaction],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error updating transactions:", data.error);
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };

  return (
    <div className="form">
      <h1>New Transaction</h1>
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
