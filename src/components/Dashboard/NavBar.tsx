import moment from "moment/moment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import menuButton from "../../assets/menuButton.svg";
import exitButton from "../../assets/blackExitButton.svg";
import "../../styles/NavBar.scss";

interface NavBarProps {
  selectedDay: moment.Moment;
  setSelectedDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

const NavBar = ({ selectedDay, setSelectedDay }: NavBarProps) => {
  const handleLeftArrowClick = () => {
    setSelectedDay(moment(selectedDay).subtract(1, "months"));
  };

  const handleRightArrowClick = () => {
    setSelectedDay(moment(selectedDay).add(1, "months"));
  };
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    window.location.reload();
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
      <div className="date-change-container">
        <button className="arrow" onClick={handleLeftArrowClick}>
          <ChevronLeftIcon fontSize="medium" />
        </button>
        <div className="date-container">
          <p className="date">{selectedDay.format("MMMM YYYY")}</p>
        </div>
        <button className="arrow" onClick={handleRightArrowClick}>
          <ChevronRightIcon fontSize="medium" />
        </button>
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
