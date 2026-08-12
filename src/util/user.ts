import { UserType } from "../types";

interface UserPayload {
  _id?: string;
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  transactions?: UserType["transactions"];
  categories?: UserType["categories"];
}

const toUserState = (payload: UserPayload): UserType => ({
  id: payload._id || payload.id || "",
  username: payload.username || "",
  email: payload.email || "",
  password: payload.password || "",
  loggedIn: true,
  transactions: payload.transactions || [],
  categories: payload.categories || []
});

export { toUserState };
