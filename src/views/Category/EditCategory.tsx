import { useState, useEffect, useRef } from "react";
import { HuePicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";
import API_URL from "../../util/env";
import "../../styles/form.scss";

interface EditCategoryProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  category: CategoryType;
}

function EditCategory({ user, setUser, category }: EditCategoryProps) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [type, setType] = useState(category.type);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);

  const incomeBox = useRef<HTMLInputElement>(null);
  const expenseBox = useRef<HTMLInputElement>(null);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const onColorChange = (event: { hex: string }) => {
    setColor(event.hex);
  };
  const onTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === "income-box" && incomeBox.current) {
      setType("income");
      if (expenseBox.current) expenseBox.current.checked = false;
    } else if (event.target.id === "expense-box" && expenseBox.current) {
      setType("expense");
      if (incomeBox.current) incomeBox.current.checked = false;
    }
  };

  const navigate = useNavigate();

  const onExit = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    if (name && color && type) {
      setDisableSubmitButton(false);
    } else {
      setDisableSubmitButton(true);
    }
  }, [name, color, type]);

  const handleDeleteSubmit = () => {
    const newCategories = user.categories.filter(
      (userCategory: CategoryType) => userCategory._id !== category._id
    );

    fetch(`${API_URL}/user/${user.id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        categories: newCategories,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setUser({ ...user, categories: newCategories });
        }
      });
  };

  const handleSubmit = () => {
    category.name = name;
    category.color = color;
    category.type = type;

    const newCategories = user.categories
      .filter((userCategory: CategoryType) => userCategory._id !== category._id)
      .push(category);

    fetch(`${API_URL}/user/${user.id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        categories: newCategories,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setUser({
            ...user,
            categories: data.categories,
            transactions: data.transactions,
          });
        }
      });

    onExit();
  };

  return (
    <div className="form">
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
      <h1>Edit Category</h1>
      <form id="edit-category-form" onSubmit={handleSubmit}>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="input"
          name="name"
          value={name}
          onChange={onNameChange}
        />

        <label htmlFor="color" className="label">
          Color
        </label>
        <HuePicker color={color} onChangeComplete={onColorChange} />
        <div className="type-container">
          <label htmlFor="type" className="label">
            Type
          </label>
          <div className="type-boxes">
            <label htmlFor="income-box">Income</label>
            <input
              type="checkbox"
              onChange={onTypeChange}
              id="income-box"
              ref={incomeBox}
              defaultChecked={type === "income" ? true : false}
            />
            <input
              type="checkbox"
              onChange={onTypeChange}
              id="expense-box"
              ref={expenseBox}
              defaultChecked={type === "expense" ? true : false}
            />
            <label htmlFor="expense-box">Expense</label>
          </div>
        </div>
        <button
          type="submit"
          className="submit-button"
          disabled={disableSubmitButton}
        >
          Submit
        </button>
      </form>
      <button className="delete-button-container" onClick={handleDeleteSubmit}>
        <p className="delete-button">Delete category</p>
      </button>
    </div>
  );
}

export default EditCategory;
