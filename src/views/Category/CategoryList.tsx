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
    user.categories.sort((a: CategoryType, b: CategoryType) =>
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

  return (
    <div className="list">
      <h2>Categories</h2>
      <div className="type-container">
        <div className="type-boxes">
          <label htmlFor="income-box">Income</label>
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
          <label htmlFor="expense-box">Expense</label>
        </div>
      </div>
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          setSelectedCategory(null);
          navigate("/dashboard");
        }}
      />
      <div className="add-button">
        <button
          className="add"
          onClick={() => {
            navigate("/new-category");
          }}
        >
          New Category
        </button>
      </div>
      <div className="items-container">
        {categories
          .filter((category: CategoryType) => {
            if (includeIncome && includeExpense) {
              return true;
            }
            if (includeIncome) {
              return category.type === "Income";
            }
            if (includeExpense) {
              return category.type === "Expense";
            }
            return false;
          })
          .map((category: CategoryType, index: number) => (
            <div
              key={index}
              className="item"
              onClick={() => {
                setSelectedCategory(category);
                navigate("/edit-category");
              }}
            >
              <Category category={category} key={index} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default CategoryList;
