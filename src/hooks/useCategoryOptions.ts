import { useEffect } from "react";
import { UserType } from "../types";

interface useCategoryOptionsProps {
  user: UserType;
  categoriesDatalist: React.RefObject<HTMLDataListElement>;
}

const useCategoryOptions = ({
  user,
  categoriesDatalist,
}: useCategoryOptionsProps) => {
  useEffect(() => {
    const categories = user.categories.map((c) => c.name);
    if (categoriesDatalist.current) {
      categoriesDatalist.current.innerHTML = "";
      categories.forEach((c) => {
        const option = document.createElement("option");
        option.value = c;
        categoriesDatalist.current?.appendChild(option);
      });
    }
  }, [user.categories, categoriesDatalist]);
};

export default useCategoryOptions;
