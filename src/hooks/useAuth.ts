import { API_URL } from "../util/api";
import { useEffect } from "react";
import { UserType } from "../types.d";

const refreshUserData = async (
  userId: string,
  setUser: React.Dispatch<React.SetStateAction<UserType>>
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error refreshing user data:", data.error);
      return false;
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
    return true;
  } catch (error) {
    console.error("Error refreshing user data:", error);
    return false;
  }
};

export function useAuth(
  user: UserType,
  setUser: React.Dispatch<React.SetStateAction<UserType>>,
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    const refresh = async () => {
      setAuthLoading(true); // 🕒 auth in progress

      try {
        if (user.id) {
          const refreshed = await refreshUserData(user.id, setUser);
          if (!refreshed) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser({
              id: "",
              username: "",
              email: "",
              password: "",
              loggedIn: false,
              transactions: [],
              categories: []
            });
          }
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            const refreshed = await refreshUserData(userData._id, setUser);
            if (!refreshed) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser({
                id: "",
                username: "",
                email: "",
                password: "",
                loggedIn: false,
                transactions: [],
                categories: []
              });
            }
          }
        }
      } finally {
        setAuthLoading(false); // ✅ done
      }
    };

    refresh();
  }, [user.id, setUser, setAuthLoading]);
}
