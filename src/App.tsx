import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import Login from "./views/Auth/Login";
import Register from "./views/Auth/Register.tsx";
import Dashboard from "./views/Dashboard/Dashboard.tsx";
import CategoryList from "./views/Category/CategoryList";
import NewCategory from "./views/Category/NewCategory.tsx";
import EditCategory from "./views/Category/EditCategory.tsx";
import TransactionList from "./views/Transaction/TransactionList.tsx";
import NewTransaction from "./views/Transaction/NewTransaction.tsx";
import EditTransaction from "./views/Transaction/EditTransaction.tsx";
import Account from "./views/Account/Account.tsx";
import Stats from "./views/Stats/Stats.tsx";
import Budgets from "./views/Budgets/Budgets.tsx";
import Landing from "./views/Landing/Landing.tsx";
import { ThemeProvider } from "./components/ThemeProvider";
import { useAuth } from "./hooks/useAuth.ts";
import { UserType, CategoryType, TransactionType } from "./types.d";
import "./styles/loading.scss";

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<UserType>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser)
      : {
          id: "",
          username: "",
          email: "",
          password: "",
          transactions: [],
          categories: [],
          loggedIn: false,
        };
  });

  const [selectedDay, setSelectedDay] = useState(
    Temporal.Now.plainDate("gregory")
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useAuth(user, setUser, setAuthLoading);

  return (
    <ThemeProvider>
      <main className="routes-main">
      {authLoading ? (
        <div className="loading" role="status" aria-live="polite">
          <div className="loading-card">
            <img src="/favicon.svg" alt="" className="loading-icon" />
            <p className="loading-label">Loading your money</p>
            <div className="loading-bar" aria-hidden>
              <span />
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          <Route
            path="/register"
            element={
              user.loggedIn ? <Navigate to="/dashboard" /> : <Register />
            }
          />
          <Route
            path="/login"
            element={
              user.loggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login setUser={setUser} />
              )
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
                  setUser={setUser}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                  setSelectedTransaction={setSelectedTransaction}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/stats"
            element={
              <Stats
                user={user}
                setUser={setUser}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                setSelectedTransaction={setSelectedTransaction}
              />
            }
          />
          <Route
            path="/budgets"
            element={
              <Budgets
                user={user}
                setUser={setUser}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
              />
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
                setSelectedDay={setSelectedDay}
              />
            }
          />
        </Routes>
      )}
      </main>
    </ThemeProvider>
  );
}

export default App;
