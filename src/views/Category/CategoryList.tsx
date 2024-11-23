import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserType, CategoryType } from "../../types.d";
import Category from "../../components/Category/Category";
import "../../styles/list.scss";

interface CategoryListProps {
  user: UserType;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<CategoryType | null>
  >;
}

function CategoryList({ user, setSelectedCategory }: CategoryListProps) {
  const [categories, setCategories] = useState(user.categories || []);

  useEffect(() => {
    setCategories(user.categories);
  }, [user.categories]);

  const handleCloseButton = () => {
    setSelectedCategory(null);
    navigate("/dashboard");
  };

  const navigate = useNavigate();

  const handleNewCategoryButton = () => {
    navigate("/new-category");
  };

  return (
    <div className="list">
      <h2>Categories</h2>
      <button className="exit-button" onClick={handleCloseButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="512"
          height="512"
          viewBox="0 0 512 512"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M84.9407 448.942C78.6923 455.19 68.5616 455.19 62.3132 448.942C56.0649 442.693 56.0649 432.563 62.3132 426.314L233 255.628L62.3132 84.9417C56.0649 78.6933 56.0649 68.5626 62.3132 62.3142C68.5616 56.0658 78.6923 56.0658 84.9407 62.3142L255.627 233.001L426.313 62.3142C432.562 56.0658 442.692 56.0658 448.941 62.3142C455.189 68.5626 455.189 78.6933 448.941 84.9417L278.254 255.628L448.941 426.314C455.189 432.563 455.189 442.693 448.941 448.942C442.692 455.19 432.562 455.19 426.313 448.942L255.627 278.255L84.9407 448.942Z"
            fill="white"
          />
        </svg>
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
