import { useState, useEffect, useRef } from "react";
import { HuePicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";
import { API_URL } from "../../util/api";
import exitButton from "../../assets/whiteExitButton.svg";
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
  const navigate = useNavigate();

  useEffect(() => {
    if (name.length > 3 && color && type) {
      setDisableSubmitButton(false);
    } else {
      setDisableSubmitButton(true);
    }
  }, [name, color, type]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const onColorChange = (event: { hex: string }) => {
    setColor(event.hex);
  };
  const onTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === "income-box" && incomeBox.current) {
      setType("Income");
      if (expenseBox.current) expenseBox.current.checked = false;
    } else if (event.target.id === "expense-box" && expenseBox.current) {
      setType("Expense");
      if (incomeBox.current) incomeBox.current.checked = false;
    }
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newCategory = {
      id: category._id,
      name,
      color,
      type,
    };

    try {
      const response = await fetch(`${API_URL}/categories/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    try {
      const response = await fetch(`${API_URL}/categories/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: category._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="form">
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      />
      <h2>Edit Category</h2>
      <form id="edit-category-form" onSubmit={handleUpdateSubmit}>
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

        <label htmlFor="color" className="label" style={{ color: color }}>
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
              defaultChecked={type === "Income" ? true : false}
            />
            <input
              type="checkbox"
              onChange={onTypeChange}
              id="expense-box"
              ref={expenseBox}
              defaultChecked={type === "Expense" ? true : false}
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
      <div className="delete-button" onClick={handleDeleteSubmit}>
        <p className="delete">Delete category</p>
      </div>
    </div>
  );
}

export default EditCategory;
