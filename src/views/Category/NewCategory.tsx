import { useState, useEffect, useRef } from "react";
import { HuePicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserType } from "../../types.d";
import { API_URL } from "../../util/api";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";
import { toUserState } from "../../util/user";

interface NewCategoryProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

function NewCategory({ user, setUser }: NewCategoryProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff0000");
  const [type, setType] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFormError(null);

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
        setFormError(data?.error || "We couldn’t add this category. Try again.");
        return;
      }

      setUser(toUserState(data.user));
      toast.success(`${name} is ready to use on your calendar.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating categories:", error);
      setFormError("We couldn’t reach the calendar. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="form">
      <p className="form-kicker">Make your money easier to recognize</p>
      <h2>Add a category</h2>
      <p className="form-intro">Choose a name and color that make sense in your life.</p>
      <button
        type="button"
        aria-label="Back to calendar"
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        <img src={exitButton} alt="" />
      </button>
      <form id="new-category-form" onSubmit={handleSubmit}>
          <label htmlFor="name" className="label">
            What should it be called?
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
            Pick a color
        </label>
        <HuePicker color={color} onChangeComplete={onColorChange} />
        <div className="type-container">
          <label htmlFor="type" className="label">
            Does money come in or go out?
          </label>
          <div className="type-boxes">
            <label htmlFor="income-box" className="type-option is-income">
              <input
                type="checkbox"
                onChange={onTypeChange}
                id="income-box"
                ref={incomeBox}
              />
              <span>Income</span>
            </label>
            <label htmlFor="expense-box" className="type-option is-expense">
              <input
                type="checkbox"
                onChange={onTypeChange}
                id="expense-box"
                ref={expenseBox}
              />
              <span>Expense</span>
            </label>
          </div>
        </div>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <div className="submit-button-container">
          <button
            type="submit"
            className="submit-button"
            disabled={disableSubmitButton || isSaving}
          >
            {isSaving ? "Adding…" : "Add category"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewCategory;
