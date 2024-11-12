import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import moment from "moment/moment";
import Login from "./routes/Login/Login";
import Register from "./routes/Register/Register.tsx";
import Calendar from "./routes/Calendar/Calendar.tsx";
import NavBar from "./routes/Calendar/NavBar";
import Footer from "./components/Footer/Footer.tsx";
import NewTransaction from "./components/Transaction/NewTransaction.tsx";
import NewCategory from "./components/Category/NewCategory.tsx";
import CategoryList from "./components/Category/CategoryList";
import DayView from "./components/Day/DayView.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import { UserType } from "./types.d";
import "./App.scss";

function App() {
  const [user, setUser] = useState<UserType>({
    id: "",
    username: "",
    email: "",
    password: "",
    loggedIn: false,
    transactions: [],
    categories: [],
  });
  const [day, setDay] = useState(moment());

  useAuth(user, setUser);

  return (
    <main className="routes-main">
      <Routes>
        <Route
          path="/"
          element={
            user.loggedIn ? (
              <Navigate to="/calendar" />
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
          path="/calendar"
          element={
            user.loggedIn ? (
              <div className="app-main">
                <NavBar user={user} day={day} setDay={setDay} />
                <Calendar user={user} day={day} setDay={setDay} />
                <Footer />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/new-transaction"
          element={<NewTransaction user={user} setUser={setUser} day={day} />}
        />
        <Route
          path="/new-category"
          element={<NewCategory user={user} setUser={setUser} />}
        />
        <Route
          path="/categories"
          element={<CategoryList user={user} setUser={setUser} />}
        />
        <Route
          path="/day-view"
          element={<DayView user={user} day={day} setDay={setDay} />}
        />
      </Routes>
    </main>
  );
}

export default App;
