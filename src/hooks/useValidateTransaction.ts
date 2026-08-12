import { useEffect } from "react";
import { UserType, CategoryType } from "../types.d";

interface useValidateTransactionProps {
  user: UserType;
  categoryInput: React.RefObject<HTMLInputElement>;
  amount: number;
  description: string;
  category: CategoryType | null;
  setDisableSubmitButton: React.Dispatch<React.SetStateAction<boolean>>;
}

const useValidateTransaction = ({
  user,
  categoryInput,
  amount,
  description,
  category,
  setDisableSubmitButton,
}: useValidateTransactionProps) => {
  useEffect(() => {
    const isCategoryValid =
      category !== null ||
      (categoryInput.current &&
        user.categories.some((c) => c.name === categoryInput.current?.value));
    const isAmountValid = amount > 0;
    const isDescriptionValid = description.trim().length > 0;

    setDisableSubmitButton(
      !(isCategoryValid && isAmountValid && isDescriptionValid)
    );
  }, [
    amount,
    description,
    category,
    user.categories,
    categoryInput,
    setDisableSubmitButton,
  ]);
};

export default useValidateTransaction;
