import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";
import {
  getDayTotal,
  getMonthTotal,
  getMonthExpenses,
  getMonthIncome,
  formatCurrency
} from "../../util/functions";
import { months } from "../../util/constants";
import LeftIcon from "@mui/icons-material/ChevronLeft";
import RightIcon from "@mui/icons-material/ChevronRight";
import WhiteMenuButton from "../../assets/whiteMenuButton.svg";
import ExitButton from "../../assets/blackExitButton.svg";
import balanceIcon from "../../assets/balance.svg";
import incomeIcon from "../../assets/income.svg";
import expensesIcon from "../../assets/expenses.svg";
import statsIcon from "../../assets/statsIcon.svg";
import categoriesIcon from "../../assets/categoriesIcon.svg";
import userIcon from "../../assets/userIcon.svg";
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
  isStatsView
}: NavBarProps) => {
  const navigate = useNavigate();
  const [isNavBarOpen, setIsNavBarOpen] = useState(isStatsView);
  const isMobile = useMediaQuery("(max-width:600px)");

  const monthDataList = useMemo(
    () =>
      months.map((month) =>
        getMonthTotal(user.transactions, month, selectedDay.year)
      ),
    [user.transactions, selectedDay.year]
  );

  const total = useMemo(
    () => getDayTotal(user.transactions, Temporal.Now.plainDateISO()),
    [user.transactions]
  );

  const income = useMemo(
    () =>
      getMonthIncome(
        user.transactions,
        months[selectedDay.month - 1],
        selectedDay.year
      ),
    [user.transactions, selectedDay.month, selectedDay.year]
  );

  const expenses = useMemo(
    () =>
      getMonthExpenses(
        user.transactions,
        months[selectedDay.month - 1],
        selectedDay.year
      ),
    [user.transactions, selectedDay.month, selectedDay.year]
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

        <div className="money-container">
          <div
            className="money-item balance-container"
            onClick={() => navigate("/dashboard")}
          >
            <img src={balanceIcon} alt="balance" />
            <p
              className={`money balance ${total.balance >= 0 ? "positive" : "negative"}`}
            >
              ${formatCurrency(total.balance)}
            </p>
          </div>
          <div
            className="money-item income-container"
            onClick={() => navigate("/stats")}
          >
            <img src={incomeIcon} alt="income" />
            <p className="money income">+${formatCurrency(income)}</p>
          </div>
          <div
            className="money-item expenses-container"
            onClick={() => navigate("/stats")}
          >
            <img src={expensesIcon} alt="expenses" />
            <p className="money expenses">-${formatCurrency(expenses)}</p>
          </div>
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
              {isStatsView ? (
                <span className="date-year">
                  {selectedDay.toLocaleString("en", { year: "numeric" })}
                </span>
              ) : (
                <>
                  <span className="date-month">
                    {selectedDay.toLocaleString("en", { month: "long" })}
                  </span>
                  <span className="date-year">
                    {" "}
                    {selectedDay.toLocaleString("en", { year: "numeric" })}
                  </span>
                </>
              )}
            </p>
          </div>

          <button className="arrow" onClick={handleRightArrowClick}>
            <RightIcon fontSize="medium" />
          </button>
        </div>

        <div className="nav-icons-container">
          <img
            src={statsIcon}
            alt="stats"
            className="nav-icon"
            width={25}
            onClick={() => navigate("/stats")}
          />
          <img
            src={categoriesIcon}
            alt="categories"
            className="nav-icon"
            width={35}
            onClick={() => navigate("/categories")}
          />
          <img
            src={userIcon}
            alt="user"
            className="nav-icon"
            width={25}
            onClick={() => navigate("/user")}
          />
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
                <p className="month-income">+${formatCurrency(data.income)}</p>
                <p className="month-expenses">
                  -${formatCurrency(data.expenses)}
                </p>
                <p className="month-balance">
                  =${formatCurrency(data.balance)}
                </p>
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
