import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import useValidateUser from "../../hooks/useValidateUser";
import Footer from "../../components/Dashboard/Footer";
import API_URL from "../../util/api";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/auth.scss";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const navigate = useNavigate();

  useValidateUser({ username, email, password, setDisableSubmitButton });

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
          }, 1000);
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
      <div className="container">
        <fieldset id="sign_up" className="fieldset">
          <legend className="legend">Register Your Account 📝</legend>
          <div className="input-container">
            <label htmlFor="name" className="label">
              Username
            </label>
            <input
              onChange={onUsernameChange}
              type="text"
              name="username"
              id="username"
              className="input"
            />
          </div>

          <div className="input-container">
            <label htmlFor="email-address" className="label">
              Email
            </label>
            <input
              onChange={onEmailChange}
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
            />
          </div>
        </fieldset>
        <div className="submit-container">
          <button
            onClick={onSubmitRegister}
            type="submit"
            className="submit-button"
            disabled={disableSubmitButton}
          >
            Register
          </button>
        </div>
        <div className="add-button">
          <Link to="/login" className="add">
            Log In
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default Register;
