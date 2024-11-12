import { useState, useEffect, useRef } from "react";
import { HuePicker } from "react-color";
import "../../styles/form.scss";
import API_URL from "../../util/env";
import { EditCategoryProps } from "../../types.d";

function EditCategory({
  category,
  user,
  setUser,
  triggers,
  setTriggers,
}: EditCategoryProps) {
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

  const onExit = () => {
    setTriggers({ ...triggers, editCategory: false });
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
      (userCategory) => userCategory.id !== category.id
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

    setTriggers({ ...triggers, editCategory: false });
  };

  const handleSubmit = () => {
    category.name = name;
    category.color = color;
    category.type = type;

    const newCategories = user.categories
      .filter((userCategory) => userCategory.id !== category.id)
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

    setTriggers({ ...triggers, editCategory: false });
  };

  return (
    <div className="form">
      <button className="exit-button" onClick={onExit}>
        X
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
