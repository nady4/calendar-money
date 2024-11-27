import moment from "moment/moment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getBalanceByDay } from "../../util/balance";
import { UserType } from "../../types";
import { useNavigate } from "react-router-dom";
import menuButton from "../../styles/menuButton.svg";
import exitButton from "../../styles/blackExitButton.svg";
import "../../styles/NavBar.scss";

interface NavBarProps {
  user: UserType;
  day: moment.Moment;
  setDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

const NavBar = ({ user, day, setDay }: NavBarProps) => {
  const handleLeftArrowClick = () => {
    setDay(moment(day).subtract(1, "months"));
  };

  const handleRightArrowClick = () => {
    setDay(moment(day).add(1, "months"));
  };
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };
  const navigate = useNavigate();
  const handleCategoriesClick = () => {
    navigate("/categories");
  };

  return (
    <div className="navbar">
      <div
        className="menu-button-container"
        onClick={() => window.location.reload()}
      >
        <img
          className="menu-button"
          src={menuButton}
          alt="logo"
          height={"40px"}
        />
      </div>
      <div className="user-data-container">
        <div className="today-date-container">
          <p className="today-date">{moment().format("DD MMM")}</p>
        </div>
        <div className="user-balance-container">
          <p className="user-balance">
            ${getBalanceByDay(user.transactions, day)}
          </p>
        </div>
      </div>
      <div className="date-change-container">
        <button className="left-arrow" onClick={handleLeftArrowClick}>
          <ChevronLeftIcon fontSize="small" />
        </button>
        <div className="date-container">
          <p className="date">{day.format("MMMM YYYY")}</p>
        </div>
        <button className="right-arrow" onClick={handleRightArrowClick}>
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>
      <div className="categories-button-container">
        <p className="categories-button" onClick={handleCategoriesClick}>
          Categories
        </p>
      </div>
      <div className="logout-container">
        <button className="logout-button-container" onClick={handleLogoutClick}>
          <img className="logout-button" src={exitButton} alt="logout" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
