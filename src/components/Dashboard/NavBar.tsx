import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { Temporal } from "@js-temporal/polyfill";
import SearchIcon from "@mui/icons-material/Search";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { UserType, TransactionType } from "../../types";
import { setHeldImage } from "../../util/scannedImageHolder";
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
import balanceIcon from "../../assets/balance.svg";
import incomeIcon from "../../assets/income.svg";
import expensesIcon from "../../assets/expenses.svg";
import "../../styles/NavBar.scss";

interface NavBarProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isStatsView: boolean;
  setSelectedTransaction: React.Dispatch<
    React.SetStateAction<TransactionType | null>
  >;
}

const NavBar = ({
  user,
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen,
  isStatsView,
  setSelectedTransaction
}: NavBarProps) => {
  const navigate = useNavigate();
  const [isNavBarOpen, setIsNavBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const scanButtonRef = useRef<HTMLButtonElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isScanOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        scanButtonRef.current &&
        !scanButtonRef.current.contains(event.target as Node)
      ) {
        setIsScanOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isScanOpen]);

  const handleScanFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setIsScanOpen(false);
    if (!file) return;
    setHeldImage(file);
    navigate("/scan-review");
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return user.transactions
      .filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          t.category?.name?.toLowerCase().includes(query)
      )
      .map((t) => {
        const date =
          typeof t.date === "string"
            ? Temporal.PlainDate.from(t.date.split("T")[0])
            : (t.date as Temporal.PlainDate);
        return { ...t, date };
      })
      .slice(0, 8);
  }, [searchQuery, user.transactions]);

  const handleSelectResult = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setSearchQuery("");
    setIsSearchFocused(false);
    navigate("/edit-transaction");
  };

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
          className={`menu-button-container ${
            isDropdownOpen ? "is-hidden" : ""
          }`}
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

        {!isStatsView && (
          <div className="date-change-container">
            <button className="arrow" onClick={handleLeftArrowClick}>
              <LeftIcon fontSize="medium" />
            </button>

            <div
              className="date-container"
              onClick={() => setIsNavBarOpen(!isNavBarOpen)}
            >
              <p className="date">
                <span className="date-month">
                  {selectedDay.toLocaleString("en", { month: "long" })}
                </span>
                <span className="date-year">
                  {" "}
                  {selectedDay.toLocaleString("en", { year: "numeric" })}
                </span>
              </p>
            </div>

            <button className="arrow" onClick={handleRightArrowClick}>
              <RightIcon fontSize="medium" />
            </button>
          </div>
        )}

        <div className="search-container">
          <div className="search-bar">
            <SearchIcon className="search-icon" fontSize="small" />
            <input
              type="text"
              className="search-input"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            />
          </div>

          {isSearchFocused && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((t) => {
                const isIncome = t.category?.type === "Income";
                return (
                  <div
                    key={t._id}
                    className="search-result-item"
                    onMouseDown={() => handleSelectResult(t)}
                  >
                    <div className="search-result-info">
                      <p className="search-result-description">
                        {t.description}
                      </p>
                      <p className="search-result-meta">
                        {t.category?.name} ·{" "}
                        {`${String(t.date.day).padStart(2, "0")}/${String(
                          t.date.month
                        ).padStart(2, "0")}/${t.date.year}`}
                      </p>
                    </div>
                    <p
                      className={`search-result-amount ${
                        isIncome ? "positive" : "negative"
                      }`}
                    >
                      {isIncome ? "+" : "-"}$
                      {formatCurrency(Math.abs(t.amount))}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="scan-container">
          <button
            type="button"
            ref={scanButtonRef}
            className="scan-button"
            aria-label="Scan invoice"
            aria-haspopup="true"
            aria-expanded={isScanOpen}
            onClick={() => setIsScanOpen((prev) => !prev)}
          >
            <AddAPhotoIcon fontSize="small" />
          </button>

          {isScanOpen && (
            <div className="scan-popover" role="menu">
              <button
                type="button"
                className="scan-popover-item"
                onClick={() => cameraInputRef.current?.click()}
              >
                <PhotoCameraIcon fontSize="small" />
                <span>Take photo</span>
              </button>
              <button
                type="button"
                className="scan-popover-item"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadFileIcon fontSize="small" />
                <span>Upload image</span>
              </button>
            </div>
          )}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="scan-file-input"
            onChange={handleScanFile}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="scan-file-input"
            onChange={handleScanFile}
          />
        </div>

        <div className="logo-container">
          <button
            className="logo-button-container"
            onClick={() => navigate("/")}
            aria-label="Go to landing"
          >
            <img className="logo-button" src="/favicon.svg" alt="logo" />
          </button>
        </div>
      </div>

      {!isStatsView && (
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
                  <p className="month-income">
                    +${formatCurrency(data.income)}
                  </p>
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
      )}

      {!isStatsView && (
        <div
          className={`gradient-border-bottom gradient-${
            isNavBarOpen ? "open" : "closed"
          }`}
        ></div>
      )}
    </div>
  );
};

export default NavBar;
