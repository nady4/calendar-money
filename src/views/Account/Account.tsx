import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../util/api";
import { UserType } from "../../types.d";
import useValidateUser from "../../hooks/useValidateUser";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/form.scss";

interface AccountProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

const Account = ({ user, setUser }: AccountProps) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const navigate = useNavigate();

  useValidateUser({ username, email, password, setDisableSubmitButton });

  const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    const newUser = {
      username,
      email,
      password,
    };

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser(data);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      setUser({} as UserType);
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="form">
      <h2>Account</h2>
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          navigate("/dashboard");
        }}
      />
      <form onSubmit={handleUpdateSubmit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={onUsernameChange}
        />
        <label htmlFor="email">Email</label>
        <input
          className="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={onEmailChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
        />
        <div className="submit-button-container">
          <button
            type="button"
            className="submit-button"
            disabled={disableSubmitButton}
            onClick={handleUpdateSubmit}
          >
            Submit
          </button>
        </div>
        <div className="delete-button" onClick={handleDeleteSubmit}>
          <p className="delete">Delete User</p>
        </div>
      </form>
    </div>
  );
};

export default Account;
