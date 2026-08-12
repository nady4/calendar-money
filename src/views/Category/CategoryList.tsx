import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";
import Category from "../../components/Category/Category";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/list.scss";

interface CategoryListProps {
  user: UserType;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<CategoryType | null>
  >;
}

function CategoryList({ user, setSelectedCategory }: CategoryListProps) {
  const [categories, setCategories] = useState(
    [...user.categories].sort((a: CategoryType, b: CategoryType) =>
      a.name.localeCompare(b.name)
    ) || []
  );
  const [includeIncome, setIncludeIncome] = useState(true);
  const [includeExpense, setIncludeExpense] = useState(true);
  const navigate = useNavigate();

  const onTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    if (id === "income-box") {
      setIncludeIncome(checked);
    }
    if (id === "expense-box") {
      setIncludeExpense(checked);
    }
  };

  useEffect(() => {
    setCategories(user.categories);
  }, [user.categories]);

  const visibleCategories = categories.filter((category: CategoryType) => {
    if (includeIncome && includeExpense) return true;
    if (includeIncome) return category.type === "Income";
    if (includeExpense) return category.type === "Expense";
    return false;
  });

  return (
    <div className="list">
      <p className="list-kicker">Make the calendar easier to read</p>
      <h2>Categories</h2>
      <p className="list-description">
        Use names and colors that make your own money obvious at a glance.
      </p>
      <div className="type-container">
        <div className="type-boxes">
          <label htmlFor="income-box">Show income</label>
          <input
            type="checkbox"
            id="income-box"
            onChange={onTypeChange}
            defaultChecked={includeIncome}
          />
          <input
            type="checkbox"
            id="expense-box"
            onChange={onTypeChange}
            defaultChecked={includeExpense}
          />
          <label htmlFor="expense-box">Show expenses</label>
        </div>
      </div>
      <button
        type="button"
        aria-label="Back to calendar"
        className="exit-button"
        onClick={() => {
          setSelectedCategory(null);
          navigate("/dashboard");
        }}
      >
        <img src={exitButton} alt="" />
      </button>
      <div className="add-button">
        <button
          className="add"
          onClick={() => {
            navigate("/new-category");
          }}
        >
          Add category
        </button>
      </div>
      <div className="items-container">
        {visibleCategories.length === 0 ? (
          <div className="list-empty-state">
            <p>No categories match these filters.</p>
            <span>Choose another view or add a category to keep going.</span>
          </div>
        ) : (
          visibleCategories.map((category: CategoryType) => (
            <button
              type="button"
              key={category._id}
              className="item"
              onClick={() => {
                setSelectedCategory(category);
                navigate("/edit-category");
              }}
            >
              <Category category={category} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryList;
