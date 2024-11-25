import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";
import Category from "../../components/Category/Category";
import exitButton from "../../styles/whiteExitButton.svg";
import "../../styles/list.scss";

interface CategoryListProps {
  user: UserType;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<CategoryType | null>
  >;
}

function CategoryList({ user, setSelectedCategory }: CategoryListProps) {
  const [categories, setCategories] = useState(user.categories || []);
  const navigate = useNavigate();

  useEffect(() => {
    setCategories(user.categories);
  }, [user.categories]);

  const handleCloseButton = () => {
    setSelectedCategory(null);
    navigate("/dashboard");
  };

  const handleNewCategoryButton = () => {
    navigate("/new-category");
  };

  return (
    <div className="list">
      <h2>Categories</h2>
      <button className="exit-button" onClick={handleCloseButton}>
        <img src={exitButton} className="exit-button-logo" />
      </button>
      <div className="new-button-container">
        <button className="new-button" onClick={handleNewCategoryButton}>
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
