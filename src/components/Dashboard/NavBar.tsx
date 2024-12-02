import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { getDayTotal } from "../../util/functions";
import { UserType } from "../../types";
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
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [isNavBarOpen, setIsNavBarOpen] = useState(false);

  const getLastDayOfMonth = (date: Temporal.PlainDate, month: number) => {
    const firstDayOfMonth = date.with({ month, day: 1 });
    return firstDayOfMonth.add({ months: 1 }).subtract({ days: 1 });
  };

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
            className="month-container"
            key={index}
            onClick={() => {
              setSelectedDay(selectedDay.with({ month: index + 1 }));
            }}
          >
            <div className="month-header">
              <p
                className={`month ${
                  window.innerWidth < 600
                    ? getDayTotal(
                        user.transactions,
                        getLastDayOfMonth(selectedDay, index + 1)
                      ).balance >= 0
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
                {
                  getDayTotal(
                    user.transactions,
                    getLastDayOfMonth(selectedDay, index + 1)
                  ).income
                }
              </p>
              <p className="month-expenses">
                -$
                {
                  getDayTotal(
                    user.transactions,
                    getLastDayOfMonth(selectedDay, index + 1)
                  ).expenses
                }
              </p>
              <p className="month-balance">
                =$
                {
                  getDayTotal(
                    user.transactions,
                    getLastDayOfMonth(selectedDay, index + 1)
                  ).balance
                }
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
