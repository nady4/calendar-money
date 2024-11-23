import moment from "moment/moment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Logo from "../../assets/favicon.svg";
import { getBalanceByDay } from "../../util/balance";
import { UserType } from "../../types";
import { useNavigate } from "react-router-dom";
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
      <div className="logo-container" onClick={() => window.location.reload()}>
        <img className="logo" src={Logo} alt="logo" height={"40px"} />
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
          <p className="date">{day.format("MM / YYYY")}</p>
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
        <button className="logout-button" onClick={handleLogoutClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="512"
            height="512"
            viewBox="0 0 512 512"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M84.9407 448.942C78.6923 455.19 68.5616 455.19 62.3132 448.942C56.0649 442.693 56.0649 432.563 62.3132 426.314L233 255.628L62.3132 84.9417C56.0649 78.6933 56.0649 68.5626 62.3132 62.3142C68.5616 56.0658 78.6923 56.0658 84.9407 62.3142L255.627 233.001L426.313 62.3142C432.562 56.0658 442.692 56.0658 448.941 62.3142C455.189 68.5626 455.189 78.6933 448.941 84.9417L278.254 255.628L448.941 426.314C455.189 432.563 455.189 442.693 448.941 448.942C442.692 455.19 432.562 455.19 426.313 448.942L255.627 278.255L84.9407 448.942Z"
              fill="black"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
