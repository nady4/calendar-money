import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Category from "./Category";
import EditCategory from "./EditCategory";
import { UserType, CategoryType } from "../../types.d";
import "../../styles/list.scss";

interface CategoryListProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

function CategoryList({ user, setUser }: CategoryListProps) {
  const [categories, setCategories] = useState(user.categories || []);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );

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
    <>
      {selectedCategory ? (
        <EditCategory
          user={user}
          setUser={setUser}
          category={selectedCategory}
        />
      ) : (
        <div className="list">
          <h2>Categories</h2>
          <button className="exit-button" onClick={handleCloseButton}>
            X
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
                onClick={() => setSelectedCategory(category)}
              >
                <Category category={category} key={index} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default CategoryList;
