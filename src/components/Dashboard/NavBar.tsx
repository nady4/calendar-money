import { useState, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";
import { getMonthTotal } from "../../util/functions";
import { months } from "../../util/constants";
import LeftIcon from "@mui/icons-material/ChevronLeft";
import RightIcon from "@mui/icons-material/ChevronRight";
import WhiteMenuButton from "../../assets/whiteMenuButton.svg";
import ExitButton from "../../assets/blackExitButton.svg";
import "../../styles/NavBar.scss";

interface NavBarProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isStatsView: boolean;
}

const NavBar = ({
  user,
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen,
  isStatsView,
}: NavBarProps) => {
  const [isNavBarOpen, setIsNavBarOpen] = useState(isStatsView);
  const isMobile = useMediaQuery("(max-width:600px)");

  const monthDataList = useMemo(
    () =>
      months.map((month) =>
        getMonthTotal(user.transactions, month, selectedDay.year)
      ),
    [user.transactions, selectedDay.year]
  );

  const handleLeftArrowClick = () => {
    setSelectedDay(
      isStatsView
        ? selectedDay.subtract({ years: 1 })
        : selectedDay.subtract({ months: 1 })
    );
  };

  const handleRightArrowClick = () => {
    setSelectedDay(
      isStatsView
        ? selectedDay.add({ years: 1 })
        : selectedDay.add({ months: 1 })
    );
  };

  return (
    <div className="navbar">
      <div className="navbar-top">
        <div className="gradient-border-top"></div>
        <div
          className="menu-button-container"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img
            className="menu-button"
            src={WhiteMenuButton}
            alt="menu"
            height={"40px"}
          />
        </div>

        <div className="date-change-container">
          <button className="arrow" onClick={handleLeftArrowClick}>
            <LeftIcon fontSize="medium" />
          </button>

          <div
            className="date-container"
            onClick={() => setIsNavBarOpen(isStatsView ? true : !isNavBarOpen)}
          >
            <p className="date">
              {isStatsView
                ? selectedDay.toLocaleString("en", { year: "numeric" })
                : selectedDay.toLocaleString("en", {
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
        {months.map((month, index) => {
          const data = monthDataList[index];
          const isActive = selectedDay.month === index + 1;

          const mobileClass =
            isMobile &&
            (data.balance >= 0 ? "positive-month" : "negative-month");

          return (
            <div
              key={index}
              className={`month-container ${isActive ? "active-month" : ""}`}
              onClick={() =>
                setSelectedDay(selectedDay.with({ month: index + 1 }))
              }
            >
              <div className="month-header">
                <p className={`month ${mobileClass || ""}`}>
                  {isMobile ? month.slice(0, 1) : month}
                </p>
              </div>

              <div className="month-body">
                <p className="month-income">+${data.income}</p>
                <p className="month-expenses">-${data.expenses}</p>
                <p className="month-balance">=${data.balance}</p>
              </div>
            </div>
          );
        })}
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
