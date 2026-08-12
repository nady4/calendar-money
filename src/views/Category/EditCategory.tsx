import { useState, useEffect, useRef } from "react";
import { HuePicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserType, CategoryType } from "../../types.d";
import { API_URL } from "../../util/api";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";
import { toUserState } from "../../util/user";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
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
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFormError(null);

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
        throw new Error(data?.error || "We couldn’t save this category.");
      }

      setUser(toUserState(data.user));
      toast.success(`${name} is updated across your calendar.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating category:", error);
      setFormError(error instanceof Error ? error.message : "We couldn’t save this category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    if (isDeleting) return;
    setIsDeleting(true);
    setFormError(null);

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
        throw new Error(data?.error || "We couldn’t remove this category.");
      }

      setUser(toUserState(data.user));
      toast.success(`${category.name} and its calendar entries were removed.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting category:", error);
      setFormError(error instanceof Error ? error.message : "We couldn’t remove this category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="form">
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
      <p className="form-kicker">Keep your calendar easy to read</p>
      <h2>Change this category</h2>
      <p className="form-intro">Updates will apply wherever this category appears.</p>
      <form id="edit-category-form" onSubmit={handleUpdateSubmit}>
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
                defaultChecked={type === "Income" ? true : false}
              />
              <span>Income</span>
            </label>
            <label htmlFor="expense-box" className="type-option is-expense">
              <input
                type="checkbox"
                onChange={onTypeChange}
                id="expense-box"
                ref={expenseBox}
                defaultChecked={type === "Expense" ? true : false}
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
          <button
            type="submit"
            className="submit-button"
            disabled={disableSubmitButton || isSaving || isDeleting}
          >
          {isSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      <div className={`delete-button ${deleteConfirm ? "is-confirming" : ""}`}>
        <button type="button" className="delete" onClick={handleDeleteSubmit} disabled={isDeleting}>
          {deleteConfirm ? "Confirm removal" : "Remove category"}
        </button>
        {deleteConfirm && !isDeleting && (
          <button type="button" className="delete-cancel" onClick={() => setDeleteConfirm(false)}>
            Keep category
          </button>
        )}
      </div>
    </div>
  );
}

export default EditCategory;
