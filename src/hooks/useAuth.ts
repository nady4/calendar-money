import { API_URL } from "../util/api";
import { useEffect } from "react";
import { UserType } from "../types.d";

const refreshUserData = async (
  userId: string,
  setUser: React.Dispatch<React.SetStateAction<UserType>>
) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();
    console.log("User data refreshed:", data);

    if (!response.ok) {
      console.error("Error refreshing user data:", data.error);
      return;
    }

    setUser({
      id: data.user._id,
      username: data.user.username,
      email: data.user.email,
      password: data.user.password,
      loggedIn: true,
      transactions: data.user.transactions,
      categories: data.user.categories,
    });
  } catch (error) {
    console.error("Error refreshing user data:", error);
  }
};

export function useAuth(
  user: UserType,
  setUser: React.Dispatch<React.SetStateAction<UserType>>
) {
  useEffect(() => {
    if (user.id) {
      refreshUserData(user.id, setUser);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        refreshUserData(userData._id, setUser);
      }
    }
  }, [user.id, setUser]);
}
