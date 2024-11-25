import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import moment from "moment/moment";
import Login from "./views/Login/Login";
import Register from "./views/Register/Register.tsx";
import Dashboard from "./views/Dashboard/Dashboard.tsx";
import CategoryList from "./views/Category/CategoryList";
import NewCategory from "./views/Category/NewCategory.tsx";
import EditCategory from "./views/Category/EditCategory.tsx";
import TransactionList from "./views/Transaction/TransactionList.tsx";
import NewTransaction from "./views/Transaction/NewTransaction.tsx";
import EditTransaction from "./views/Transaction/EditTransaction.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import { UserType, CategoryType, TransactionType } from "./types.d";
import "./App.scss";

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
  const [day, setDay] = useState(moment());
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
          path="/dashboard"
          element={
            user.loggedIn ? (
              <Dashboard user={user} day={day} setDay={setDay} />
            ) : (
              <Navigate to="/login" />
            )
          }
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
              day={day}
              setDay={setDay}
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
          element={<NewTransaction user={user} setUser={setUser} day={day} />}
        />
      </Routes>
    </main>
  );
}

export default App;
