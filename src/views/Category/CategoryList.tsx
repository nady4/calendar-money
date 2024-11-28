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
  const navigate = useNavigate();

  useEffect(() => {
    setCategories(user.categories);
  }, [user.categories]);

  return (
    <div className="list">
      <h2>Categories</h2>
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          setSelectedCategory(null);
          navigate("/dashboard");
        }}
      />
      <div className="link-button">
        <button
          className="link"
          onClick={() => {
            navigate("/new-category");
          }}
        >
          New Category
        </button>
      </div>
      <div className="items-container">
        {categories.map((category: CategoryType, index: number) => (
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
