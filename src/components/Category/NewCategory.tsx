import React, { useState, useEffect, useRef } from "react";
import { HuePicker } from "react-color";
import "../../styles/form.scss";
import API_URL from "../../util/env";

function NewCategory({ user, setUser, triggers, setTriggers }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff0000");
  const [type, setType] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);

  const incomeBox = useRef(null);
  const expenseBox = useRef(null);

  const onExit = () => {
    setTriggers({ ...triggers, newCategory: false });
  };

  const onNameChange = (event) => {
    setName(event.target.value);
  };
  const onColorChange = (color, event) => {
    setColor(color.hex);
  };
  const onTypeChange = (event) => {
    if (event.target.id === "income-box") {
      setType("income");
      expenseBox.current.checked = false;
    } else if (event.target.id === "expense-box") {
      setType("expense");
      incomeBox.current.checked = false;
    }
  };

  useEffect(() => {
    name && color && type
      ? setDisableSubmitButton(false)
      : setDisableSubmitButton(true);
  }, [name, color, type]);

  const handleSubmit = async () => {
    const newCategory = {
      name,
      color,
      type,
    };
    console.log(newCategory);

    try {
      const response = await fetch(`${API_URL}/user/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          categories: [...(user.categories || []), newCategory],
        }),
      });

      const data = await response.json();
      console.log("Received user data:", data.user.categories); // Add this log

      if (!response.ok) {
        console.error("Error updating categories:", data.error);
        return;
      }

      setUser(data.user);
      setTriggers({ ...triggers, newCategory: false });
    } catch (error) {
      console.error("Error updating categories:", error);
    }
  };

  return (
    <div className="form">
      <button className="exit-button" onClick={onExit}>
        X
      </button>
      <h1>New Category</h1>
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
