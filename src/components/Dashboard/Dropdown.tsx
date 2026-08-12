import { useLocation, useNavigate } from "react-router-dom";
import { UserType } from "../../types";
import { API_URL } from "../../util/api";
import CatUser from "../../assets/catUser.svg";
import UserIcon from "../../assets/userIcon.svg";
import CalendarIcon from "../../assets/calendarIcon.svg";
import CategoriesIcon from "../../assets/categoriesIcon.svg";
import StatsIcon from "../../assets/statsIcon.svg";
import BudgetIcon from "../../assets/budgetIcon.svg";
import LogoutIcon from "../../assets/logoutIcon.svg";
import "../../styles/Dropdown.scss";
import { memo } from "react";

interface DropdownProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Dropdown = ({
  user,
  setUser,
  isDropdownOpen,
  setIsDropdownOpen
}: DropdownProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const itemClass = (path: string) =>
    `dropdown-item ${location.pathname === path ? "is-active" : ""}`;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        console.error("Backend logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error during backend logout fetch:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser({
        id: "",
        username: "",
        email: "",
        password: "",
        transactions: [],
        categories: [],
        loggedIn: false
      });

      navigate("/login");
      setIsDropdownOpen(false);
    }
  };

  return (
    <div
      className={`dropdown-container ${
        isDropdownOpen ? "dropdown-open" : "dropdown-closed"
      }`}
    >
      <button
        type="button"
        aria-label="Close menu"
        className="dropdown-close"
        onClick={() => setIsDropdownOpen(false)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      </button>
      <div className="dropdown-header">
        <img className="dropdown-user-icon" src={CatUser} alt="user" />
        <h2 className="dropdown-username">{user.username}</h2>
        <h3 className="dropdown-email">{user.email}</h3>
      </div>
      <div className="dropdown-body">
        <button
          type="button"
          className={itemClass("/account")}
          onClick={() => {
            setIsDropdownOpen(false);
            navigate("/account");
          }}
        >
          <img className="dropdown-item-icon" src={UserIcon} alt="account" />
          <p className="dropdown-item-text">Account</p>
        </button>
        <button
          type="button"
          className={itemClass("/dashboard")}
          onClick={() => {
            setIsDropdownOpen(false);
            navigate("/dashboard");
          }}
        >
          <img
            className="dropdown-item-icon"
            src={CalendarIcon}
            alt="dashboard"
          />
          <p className="dropdown-item-text">Calendar</p>
        </button>
        <button
          type="button"
          className={itemClass("/categories")}
          onClick={() => {
            setIsDropdownOpen(false);
            navigate("/categories");
          }}
        >
          <img
            className="dropdown-item-icon"
            src={CategoriesIcon}
            alt="categories"
          />
          <p className="dropdown-item-text">Categories</p>
        </button>
        <button
          type="button"
          className={itemClass("/stats")}
          onClick={() => {
            setIsDropdownOpen(false);
            navigate("/stats");
          }}
        >
          <img className="dropdown-item-icon" src={StatsIcon} alt="stats" />
          <p className="dropdown-item-text">Stats</p>
        </button>
        <button
          type="button"
          className={itemClass("/budgets")}
          onClick={() => {
            setIsDropdownOpen(false);
            navigate("/budgets");
          }}
        >
          <img className="dropdown-item-icon" src={BudgetIcon} alt="budgets" />
          <p className="dropdown-item-text">Budgets</p>
        </button>
      </div>
      <div className="dropdown-footer">
        <button type="button" className="dropdown-item" onClick={handleLogout}>
          <img className="dropdown-item-icon" src={LogoutIcon} alt="logout" />
          <p className="dropdown-item-text">Log out</p>
        </button>
      </div>
    </div>
  );
};

export default memo(Dropdown);
