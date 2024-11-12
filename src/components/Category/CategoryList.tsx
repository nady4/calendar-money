import { useState, useEffect } from "react";
import Category from "./Category";
import "../../styles/list.scss";
import { CategoryType, CategoryListProps } from "../../types.d";

function CategoryList({
  user,
  setUser,
  setCategory,
  triggers,
  setTriggers,
}: CategoryListProps) {
  const [categories, setCategories] = useState(user.categories || []);

  useEffect(() => {
    setCategories(user.categories);
  }, [user.categories]);

  const updateTriggers = (newValues: Partial<typeof triggers>) => {
    setTriggers((prevTriggers) => ({
      ...prevTriggers,
      newCategory: prevTriggers.newCategory,
      ...newValues,
    }));
  };

  const handleCloseButton = () => updateTriggers({ categoryList: false });
  const handleNewCategoryButton = () =>
    updateTriggers({ categoryList: false, newCategory: true });

  return (
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
          <Category
            user={user}
            setUser={setUser}
            category={category}
            setCategory={setCategory}
            triggers={triggers}
            setTriggers={setTriggers}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export default CategoryList;
