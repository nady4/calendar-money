import API_URL from "../../util/env";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.scss";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const onPasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const toastConfig = {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
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

      //Error codes
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
            loggedIn: true,
            transactions: data.user.transactions,
            categories: data.user.categories,
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
      <div className="log-in-container">
        <fieldset id="log_up" className="log-in-fieldset">
          <legend className="log-in-legend">Log In</legend>
          <div className="log-in-input-container">
            <label htmlFor="email-address" className="log-in-label">
              Username
            </label>
            <input
              onChange={onUsernameChange}
              type="email"
              name="email-address"
              id="email-address"
              className="log-in-input"
            />
          </div>
          <div className="log-in-input-container">
            <label htmlFor="password" className="log-in-label">
              Password
            </label>
            <input
              onChange={onPasswordChange}
              type="password"
              name="password"
              id="password"
              className="log-in-input"
            />
          </div>
        </fieldset>
        <div className="log-in-submit-container">
          <button
            onClick={onSubmitLogin}
            type="submit"
            className="log-in-submit-button"
          >
            Enter
          </button>
        </div>
        <div className="register-link-container">
          <Link to="/register" className="register-link">
            Register
          </Link>
        </div>
        <div className="test-login-data-container">
          <p className="test-login-data">
            If you want to test the app use these credentials
          </p>
          <p className="test-login-data">Username: test</p>
          <p className="test-login-data">Password: TEST1234</p>
        </div>
      </div>
    </main>
  );
}

export default Login;
