import { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../../components/Dashboard/Footer";
import { UserType } from "../../types.d";
import API_URL from "../../util/env";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/auth.scss";

function Login({
  setUser,
}: {
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const toastConfig = {
    position: "top-center" as const,
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmitLogin();
    }
  };

  const onSubmitLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      switch (response.status) {
        case 200:
          toast.success("Login successful", toastConfig);
          break;

        case 400:
          toast.error("Username not found", toastConfig);
          break;

        case 401:
          toast.error("Password incorrect", toastConfig);
          break;

        default:
          toast.error(`Error: ${response.status}`, toastConfig);
      }

      const data = await response.json();

      setTimeout(() => {
        if (data.user) {
          setUser({
            id: data.user._id,
            username: data.user.username,
            email: data.user.email,
            password: data.user.password,
            transactions: data.user.transactions,
            categories: data.user.categories,
            loggedIn: true,
          });
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
      }, 2000);
    } catch (error) {
      console.error("Error during fetch:", error);
      toast.error("Network error or server is unreachable", toastConfig);
    }
  };

  return (
    <main>
      <ToastContainer />
      <div className="container">
        <fieldset id="log_up" className="fieldset">
          <legend className="legend">Nice to see you again! 👋</legend>
          <div className="input-container">
            <label htmlFor="email-address" className="label">
              Username
            </label>
            <input
              onChange={onUsernameChange}
              type="email"
              name="email-address"
              id="email-address"
              className="input"
            />
          </div>
          <div className="input-container">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              onChange={onPasswordChange}
              type="password"
              name="password"
              id="password"
              className="input"
              onKeyDown={handleKeyDown}
            />
          </div>
        </fieldset>
        <div className="submit-container">
          <button
            onClick={onSubmitLogin}
            type="submit"
            className="submit-button"
          >
            Log In
          </button>
        </div>
        <div className="link-container">
          <Link to="/register" className="link">
            Register
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default Login;
