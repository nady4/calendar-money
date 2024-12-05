import { CategoryType } from "../../types.d";
import "../../styles/list-item.scss";

function Category({ category }: { category: CategoryType }) {
  return (
    <div className="item" style={{ backgroundColor: category.color }}>
      <div className="category-name">{category.name}</div>
      <div className="category-type">{category.type}</div>
    </div>
  );
}

export default Category;
