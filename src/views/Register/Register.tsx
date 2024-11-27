import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../../components/Dashboard/Footer";
import API_URL from "../../util/env";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Register.scss";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

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
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onSubmitRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.text();

      switch (response.status) {
        case 200:
          toast.success("Registration successful", toastConfig);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          break;

        case 400: // Zod validation errors
          toast.error(data, toastConfig);
          break;

        case 402: // Username not available
          toast.error(data, toastConfig);
          break;

        case 403: // Email not available
          toast.error(data, toastConfig);
          break;

        case 500: // Server error
          toast.error(data, toastConfig);
          break;

        default:
          toast.error("An unexpected error occurred", toastConfig);
      }
    } catch (error) {
      // Network or parsing errors
      console.error("Registration error:", error);
      toast.error("Connection error. Please try again.", toastConfig);
    }
  };

  return (
    <main>
      <ToastContainer />
      <div className="register-container">
        <fieldset id="sign_up" className="register-fieldset">
          <legend className="register-legend">Register</legend>
          <div className="register-input-container">
            <label htmlFor="name" className="register-label">
              Username
            </label>
            <input
              onChange={onUsernameChange}
              type="text"
              name="username"
              id="username"
              className="register-input"
            />
          </div>

          <div className="register-input-container">
            <label htmlFor="email-address" className="register-label">
              Email
            </label>
            <input
              onChange={onEmailChange}
              type="email"
              name="email-address"
              id="email-address"
              className="register-input"
            />
          </div>

          <div className="register-input-container">
            <label htmlFor="password" className="register-label">
              Password
            </label>
            <input
              onChange={onPasswordChange}
              type="password"
              name="password"
              id="password"
              className="register-input"
            />
          </div>
        </fieldset>
        <div className="register-submit-container">
          <button
            onClick={onSubmitRegister}
            type="submit"
            className="register-submit-button"
          >
            Register
          </button>
        </div>
        <div className="login-link-container">
          <Link to="/login" className="login-link">
            Log In
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default Register;
