import { useNavigate } from "react-router-dom";
import { UserType } from "../../types";
import { API_URL } from "../../util/api";
import CatUser from "../../assets/catUser.svg";
import UserIcon from "../../assets/userIcon.svg";
import CalendarIcon from "../../assets/calendarIcon.svg";
import CategoriesIcon from "../../assets/categoriesIcon.svg";
import StatsIcon from "../../assets/statsIcon.svg";
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
  setIsDropdownOpen,
}: DropdownProps) => {
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Backend logout failed with status:", response.status);
      } else {
        console.log("Backend logout successful");
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
        loggedIn: false,
      });

      navigate("/login");
      setIsDropdownOpen(false);
    }
  };

  if (!isDropdownOpen) {
    return null;
  }

  return (
    <div className={`dropdown-container dropdown-open`}>
      <div className="dropdown-header">
        <img className="dropdown-user-icon" src={CatUser} alt="user" />
        <h2 className="dropdown-username">{user.username}</h2>
        <h3 className="dropdown-email">{user.email}</h3>
      </div>
      <div className="dropdown-body">
        <div
          className="dropdown-item"
          onClick={() => {
            setIsDropdownOpen(false);
            navigate("/account");
          }}
        >
          <img className="dropdown-item-icon" src={UserIcon} alt="account" />
          <p className="dropdown-item-text">ACCOUNT</p>
        </div>
        <div
          className="dropdown-item"
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
          <p className="dropdown-item-text">CALENDAR</p>
        </div>
        <div
          className="dropdown-item"
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
          <p className="dropdown-item-text">CATEGORIES</p>
        </div>
        <div className="dropdown-item" onClick={handleLogout}>
          <img className="dropdown-item-icon" src={StatsIcon} alt="stats" />
          <p className="dropdown-item-text">STATS</p>
        </div>
      </div>
      <div className="dropdown-footer">
        <div className="dropdown-item" onClick={handleLogout}>
          <img className="dropdown-item-icon" src={LogoutIcon} alt="logout" />
          <p className="dropdown-item-text">LOGOUT</p>
        </div>
      </div>
    </div>
  );
};

export default memo(Dropdown);
