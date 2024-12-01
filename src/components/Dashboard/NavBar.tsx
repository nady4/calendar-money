import { Temporal } from "@js-temporal/polyfill";
import LeftIcon from "@mui/icons-material/ChevronLeft";
import RightIcon from "@mui/icons-material/ChevronRight";
import BlackMenuButton from "../../assets/blackMenuButton.svg";
import WhiteMenuButton from "../../assets/whiteMenuButton.svg";
import ExitButton from "../../assets/blackExitButton.svg";
import "../../styles/NavBar.scss";

interface NavBarProps {
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavBar = ({
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen,
}: NavBarProps) => {
  const handleLeftArrowClick = () => {
    setSelectedDay(selectedDay.subtract({ months: 1 }));
  };

  const handleRightArrowClick = () => {
    setSelectedDay(selectedDay.add({ months: 1 }));
  };

  return (
    <div className="navbar">
      <div
        className="menu-button-container"
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        <img
          className="menu-button"
          src={isDropdownOpen ? WhiteMenuButton : BlackMenuButton}
          alt="logo"
          height={"40px"}
        />
      </div>
      <div className="date-change-container">
        <button className="arrow" onClick={handleLeftArrowClick}>
          <LeftIcon fontSize="medium" />
        </button>
        <div className="date-container">
          <p className="date">
            {selectedDay.toLocaleString("en", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button className="arrow" onClick={handleRightArrowClick}>
          <RightIcon fontSize="medium" />
        </button>
      </div>
      <div className="logout-container">
        <button
          className="logout-button-container"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          <img className="logout-button" src={ExitButton} alt="logout" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
