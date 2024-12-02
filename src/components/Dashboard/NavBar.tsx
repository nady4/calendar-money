import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";
import { getMonthTotal } from "../../util/functions";
import { months } from "../../util/constants";
import LeftIcon from "@mui/icons-material/ChevronLeft";
import RightIcon from "@mui/icons-material/ChevronRight";
import BlackMenuButton from "../../assets/blackMenuButton.svg";
import WhiteMenuButton from "../../assets/whiteMenuButton.svg";
import ExitButton from "../../assets/blackExitButton.svg";
import "../../styles/NavBar.scss";

interface NavBarProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavBar = ({
  user,
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen,
}: NavBarProps) => {
  const [isNavBarOpen, setIsNavBarOpen] = useState(false);

  const handleLeftArrowClick = () => {
    setSelectedDay(selectedDay.subtract({ months: 1 }));
  };

  const handleRightArrowClick = () => {
    setSelectedDay(selectedDay.add({ months: 1 }));
  };

  return (
    <div className="navbar">
      <div className="navbar-top">
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
          <div
            className="date-container"
            onClick={() => setIsNavBarOpen(!isNavBarOpen)}
          >
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
      <div
        className={`navbar-bottom navbar-${isNavBarOpen ? "open" : "closed"}`}
      >
        {months.map((month, index) => (
          <div
            className={`month-container ${
              selectedDay.month === index + 1 ? "active-month" : ""
            }`}
            key={index}
            onClick={() => {
              setSelectedDay(selectedDay.with({ month: index + 1 }));
            }}
          >
            <div className="month-header">
              <p
                className={`month ${
                  window.innerWidth < 600
                    ? getMonthTotal(user.transactions, month).balance >= 0
                      ? "positive-month"
                      : "negative-month"
                    : ""
                }`}
              >
                {window.innerWidth > 600 ? month : month.slice(0, 1)}
              </p>
            </div>
            <div className="month-body">
              <p className="month-income">
                +$
                {getMonthTotal(user.transactions, month).income}
              </p>
              <p className="month-expenses">
                -$
                {getMonthTotal(user.transactions, month).expenses}
              </p>
              <p className="month-balance">
                =$
                {getMonthTotal(user.transactions, month).balance}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`gradient-border-bottom gradient-${
          isNavBarOpen ? "open" : "closed"
        }`}
      ></div>
    </div>
  );
};

export default NavBar;
