import { CategoryType } from "../../types.d";
import "../../styles/Category.scss";

function Category({ category }: { category: CategoryType }) {
  return (
    <div className="category" style={{ backgroundColor: category.color }}>
      <div className="category-name">
        <h2>{category.name}</h2>
      </div>
      <div className="category-type">
        <p>{category.type}</p>
      </div>
    </div>
  );
}

export default Category;
