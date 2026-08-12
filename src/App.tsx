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
import ScanReview from "./views/Transaction/ScanReview.tsx";
import Account from "./views/Account/Account.tsx";
import Stats from "./views/Stats/Stats.tsx";
import Budgets from "./views/Budgets/Budgets.tsx";
import Landing from "./views/Landing/Landing.tsx";
import { ThemeProvider } from "./components/ThemeProvider";
import { useAuth } from "./hooks/useAuth.ts";
import { UserType, CategoryType, TransactionType } from "./types.d";
import "./styles/loading.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RequireAuth({
  user,
  children,
}: {
  user: UserType;
  children: React.ReactNode;
}) {
  return user.loggedIn ? children : <Navigate to="/login" replace />;
}

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
      <ToastContainer position="bottom-center" autoClose={3500} theme="dark" />
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
            element={
              <RequireAuth user={user}>
                <Account user={user} setUser={setUser} />
              </RequireAuth>
            }
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
              <RequireAuth user={user}>
                <Stats
                  user={user}
                  setUser={setUser}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                  setSelectedTransaction={setSelectedTransaction}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/budgets"
            element={
              <RequireAuth user={user}>
                <Budgets
                  user={user}
                  setUser={setUser}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/categories"
            element={
              <RequireAuth user={user}>
                <CategoryList
                  user={user}
                  setSelectedCategory={setSelectedCategory}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-category"
            element={
              <RequireAuth user={user}>
                {selectedCategory ? (
                  <EditCategory
                    user={user}
                    setUser={setUser}
                    category={selectedCategory}
                  />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </RequireAuth>
            }
          />
          <Route
            path="/new-category"
            element={
              <RequireAuth user={user}>
                <NewCategory user={user} setUser={setUser} />
              </RequireAuth>
            }
          />
          <Route
            path="/transactions"
            element={
              <RequireAuth user={user}>
                <TransactionList
                  user={user}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  setSelectedTransaction={setSelectedTransaction}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/edit-transaction"
            element={
              <RequireAuth user={user}>
                {selectedTransaction ? (
                  <EditTransaction
                    user={user}
                    setUser={setUser}
                    transaction={selectedTransaction}
                  />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </RequireAuth>
            }
          />
          <Route
            path="/new-transaction"
            element={
              <RequireAuth user={user}>
                <NewTransaction
                  user={user}
                  setUser={setUser}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/scan-review"
            element={
              user.loggedIn ? (
                <ScanReview user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      )}
      </main>
    </ThemeProvider>
  );
}

export default App;
