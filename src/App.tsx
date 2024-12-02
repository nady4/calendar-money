import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import Login from "./views/Login/Login";
import Register from "./views/Register/Register.tsx";
import Dashboard from "./views/Dashboard/Dashboard.tsx";
import CategoryList from "./views/Category/CategoryList";
import NewCategory from "./views/Category/NewCategory.tsx";
import EditCategory from "./views/Category/EditCategory.tsx";
import TransactionList from "./views/Transaction/TransactionList.tsx";
import NewTransaction from "./views/Transaction/NewTransaction.tsx";
import EditTransaction from "./views/Transaction/EditTransaction.tsx";
import Account from "./views/Account/Account.tsx";
import Stats from "./views/Stats/Stats.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import { UserType, CategoryType, TransactionType } from "./types.d";
import {
  getMonthlyTotalFromCategories,
  getYearlyTotalFromCategories,
} from "./util/functions.ts";

function App() {
  const [user, setUser] = useState<UserType>({
    id: "",
    username: "",
    email: "",
    password: "",
    transactions: [],
    categories: [],
    loggedIn: false,
  });

  console.log(
    getMonthlyTotalFromCategories(
      user.transactions,
      user.categories,
      "December"
    )
  );
  console.log(
    getYearlyTotalFromCategories(user.transactions, user.categories, 2024)
  );

  const [selectedDay, setSelectedDay] = useState(
    Temporal.Now.plainDate("gregory")
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType | null>(null);

  useAuth(user, setUser);

  return (
    <main className="routes-main">
      <Routes>
        <Route
          path="/"
          element={
            user.loggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/register"
          element={user.loggedIn ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/login"
          element={
            user.loggedIn ? <Navigate to="/" /> : <Login setUser={setUser} />
          }
        />
        <Route
          path="/account"
          element={<Account user={user} setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={
            user.loggedIn ? (
              <Dashboard
                user={user}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/stats"
          element={<Stats transactions={user.transactions} />}
        />
        <Route
          path="/categories"
          element={
            <CategoryList
              user={user}
              setSelectedCategory={setSelectedCategory}
            />
          }
        />
        <Route
          path="/edit-category"
          element={
            selectedCategory ? (
              <EditCategory
                user={user}
                setUser={setUser}
                category={selectedCategory}
              />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/new-category"
          element={<NewCategory user={user} setUser={setUser} />}
        />
        <Route
          path="/transactions"
          element={
            <TransactionList
              user={user}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              setSelectedTransaction={setSelectedTransaction}
            />
          }
        />
        <Route
          path="/edit-transaction"
          element={
            selectedTransaction ? (
              <EditTransaction
                user={user}
                setUser={setUser}
                transaction={selectedTransaction}
              />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/new-transaction"
          element={
            <NewTransaction
              user={user}
              setUser={setUser}
              selectedDay={selectedDay}
            />
          }
        />
      </Routes>
    </main>
  );
}

export default App;
