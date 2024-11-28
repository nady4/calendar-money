import { useEffect } from "react";
import { z } from "zod";

const userSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, {
      message: "Password must contain at least one letter and one number",
    }),
});

interface useValidateUserProps {
  username: string;
  email: string;
  password: string;
  setDisableSubmitButton: React.Dispatch<React.SetStateAction<boolean>>;
}

const useValidateUser = ({
  username,
  email,
  password,
  setDisableSubmitButton,
}: useValidateUserProps) => {
  useEffect(() => {
    try {
      const isFormValid = userSchema.parse({ username, email, password });
      console.log(isFormValid);
      setDisableSubmitButton(!isFormValid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setDisableSubmitButton(true);
      }
      console.error(error);
    }
  }, [email, password, username, setDisableSubmitButton]);
};

export default useValidateUser;
