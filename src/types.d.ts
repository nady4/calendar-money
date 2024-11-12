interface CategoryType {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface UserType {
  id: string;
  username: string;
  email: string;
  password: string;
  loggedIn: boolean;
  transactions: Transaction[];
  categories: Category[];
}

interface CategoryProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  category: CategoryType;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  triggers: { categoryList: boolean; editCategory: boolean };
  setTriggers: React.Dispatch<
    React.SetStateAction<{ categoryList: boolean; editCategory: boolean }>
  >;
}

interface CategoryListProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  triggers: {
    categoryList: boolean;
    newCategory?: boolean;
    editCategory: boolean;
  };
  setTriggers: React.Dispatch<
    React.SetStateAction<{
      categoryList: boolean;
      newCategory?: boolean;
      editCategory: boolean;
    }>
  >;
}

interface EditCategoryProps {
  category: CategoryType;
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  triggers: {
    categoryList: boolean;
    newCategory?: boolean;
    editCategory: boolean;
  };
  setTriggers: React.Dispatch<
    React.SetStateAction<{
      categoryList: boolean;
      newCategory?: boolean;
      editCategory: boolean;
    }>
  >;
}

interface TransactionType {
  amount: number;
  description: string;
  category: Category;
}

export {
  UserType,
  CategoryType,
  CategoryProps,
  CategoryListProps,
  EditCategoryProps,
  TransactionType,
};
