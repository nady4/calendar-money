import { useState, useEffect, useRef } from "react";
import { HuePicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { UserType } from "../../types.d";
import { API_URL } from "../../util/api";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";

interface NewCategoryProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

function NewCategory({ user, setUser }: NewCategoryProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff0000");
  const [type, setType] = useState("");
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
  const onColorChange = (color: { hex: string }) => {
    setColor(color.hex);
  };
  const onTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === "income-box" && incomeBox.current) {
      setType("Income");
      if (expenseBox.current) expenseBox.current.checked = false;
    } else if (event.target.id === "expense-box") {
      setType("Expense");
      if (incomeBox.current) incomeBox.current.checked = false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newCategory = {
      name,
      color,
      type,
    };

    try {
      const response = await fetch(`${API_URL}/categories/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error updating categories:", data.error);
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating categories:", error);
    }
  };

  return (
    <div className="form">
      <h2>New Category</h2>
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      />
      <form id="new-category-form" onSubmit={handleSubmit}>
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
            />
            <input
              type="checkbox"
              onChange={onTypeChange}
              id="expense-box"
              ref={expenseBox}
            />
            <label htmlFor="expense-box">Expense</label>
          </div>
        </div>
        <div className="submit-button-container">
          <button
            type="submit"
            className="submit-button"
            disabled={disableSubmitButton}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewCategory;
