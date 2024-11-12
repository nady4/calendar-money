import moment from "moment";
interface CategoryType {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface TransactionType {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: moment.Moment;
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

export { CategoryType, TransactionType, UserType };
