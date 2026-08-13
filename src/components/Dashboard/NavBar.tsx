import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { Temporal } from "@js-temporal/polyfill";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { UserType, TransactionType } from "../../types";
import { setHeldImage } from "../../util/scannedImageHolder";
import { prepareScanFile } from "../../util/scanUpload";
import useScanQuota from "../../hooks/useScanQuota";
import {
  getMonthTotal,
  formatCurrency
} from "../../util/functions";
import { months } from "../../util/constants";
import LeftIcon from "@mui/icons-material/ChevronLeft";
import RightIcon from "@mui/icons-material/ChevronRight";
import WhiteMenuButton from "../../assets/whiteMenuButton.svg";
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isScanDragOver, setIsScanDragOver] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const scanContainerRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quota, byok } = useScanQuota(user.id);
  const quotaExhausted = !byok && quota.usedDay >= quota.limitDay;

  useEffect(() => {
    if (!isScanOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        scanContainerRef.current &&
        !scanContainerRef.current.contains(event.target as Node)
      ) {
        setIsScanOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsScanOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isScanOpen]);

  const acceptScannedFile = useCallback(
    async (raw: File) => {
      const result = await prepareScanFile(raw);
      if (!result.ok) {
        toast.error(result.message, { theme: "dark" });
        return;
      }
      result.warnings.forEach((w) => toast.warn(w, { theme: "dark" }));
      setHeldImage(result.file);
      navigate("/scan-review");
    },
    [navigate]
  );

  const handleScanFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setIsScanOpen(false);
    if (!file) return;
    acceptScannedFile(file);
  };

  useEffect(() => {
    if (!isScanOpen) return;
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            setIsScanOpen(false);
            acceptScannedFile(file);
            return;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isScanOpen, acceptScannedFile]);

  const handleScanDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setIsScanDragOver(true);
  };

  const handleScanDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setIsScanDragOver(false);
  };

  const handleScanDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsScanDragOver(false);
    const file = event.dataTransfer.files?.[0];
    setIsScanOpen(false);
    if (!file) return;
    acceptScannedFile(file);
  };

  const handleScanClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsScanOpen((prev) => !prev);
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
    setIsMobileSearchOpen(false);
    navigate("/edit-transaction");
  };

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
        <button
          type="button"
          className={`menu-button-container ${
            isDropdownOpen ? "is-hidden" : ""
          }`}
          aria-label="Open menu"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img
            className="menu-button"
            src={WhiteMenuButton}
            alt="menu"
            height={"40px"}
          />
        </button>

        {!isStatsView && (
          <div className="date-change-container">
            <button className="arrow" onClick={handleLeftArrowClick}>
              <LeftIcon fontSize="medium" />
            </button>

            <button
              type="button"
              className="date-container"
              onClick={() => setIsNavBarOpen(!isNavBarOpen)}
              aria-expanded={isNavBarOpen}
              aria-label="Choose month"
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
            </button>

            <button className="arrow" onClick={handleRightArrowClick}>
              <RightIcon fontSize="medium" />
            </button>
          </div>
        )}

        <div
          className={`search-container ${isMobileSearchOpen ? "mobile-search-open" : ""}`}
        >
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

          {isSearchFocused && searchQuery.trim() && (
            <div className="search-results">
              {searchResults.length === 0 ? (
                <p className="search-empty">No calendar entries match that search.</p>
              ) : searchResults.map((t) => {
                const isIncome = t.category?.type === "Income";
                return (
                  <button
                    type="button"
                    key={t._id}
                    className="search-result-item"
                    onMouseDown={() => handleSelectResult(t)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelectResult(t);
                      }
                    }}
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
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="buttons-container">
          <button
            type="button"
            className="mobile-search-button"
            aria-label="Search transactions"
            aria-expanded={isMobileSearchOpen}
            onClick={() => setIsMobileSearchOpen((open) => !open)}
          >
            <SearchIcon fontSize="small" />
          </button>
          <div className="scan-container" ref={scanContainerRef}>
            <button
              type="button"
              className="scan-button"
              aria-label="Scan a receipt"
              aria-haspopup="true"
              aria-expanded={isScanOpen}
              aria-disabled={quotaExhausted}
              title={
                quotaExhausted
                   ? "Daily receipt limit reached. Resets at midnight."
                   : "Scan a receipt"
              }
              onClick={handleScanClick}
            >
              <AddAPhotoIcon fontSize="small" />
            </button>

            {isScanOpen && (
              <div
                className={`scan-popover ${isScanDragOver ? "is-drag-over" : ""}`}
                role="menu"
                onDragOver={handleScanDragOver}
                onDragLeave={handleScanDragLeave}
                onDrop={handleScanDrop}
              >
                <button
                  type="button"
                  className="scan-popover-item"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={quotaExhausted}
                >
                  <PhotoCameraIcon fontSize="small" />
                           <span>Take a photo</span>
                </button>
                <button
                  type="button"
                  className="scan-popover-item"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={quotaExhausted}
                >
                  <UploadFileIcon fontSize="small" />
                           <span>Upload a receipt</span>
                </button>
                <div className="scan-quota" aria-live="polite">
                  {byok ? (
                    <span className="scan-quota-byok">
                      Using your own key · no daily limit
                    </span>
                  ) : (
                    <>
                      <div className="scan-quota-row">
                        <span>Scans today</span>
                        <span>
                          {quota.usedDay} / {quota.limitDay}
                        </span>
                      </div>
                      <div
                        className={`scan-quota-bar ${
                          quotaExhausted
                            ? "is-exhausted"
                            : quota.usedDay / Math.max(1, quota.limitDay) >= 0.8
                              ? "is-warning"
                              : ""
                        }`}
                      >
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              (quota.usedDay / Math.max(1, quota.limitDay)) *
                                100
                            )}%`
                          }}
                        />
                      </div>
                      {quotaExhausted && (
                        <p className="scan-quota-warning">
                           Daily receipt limit reached. Resets at midnight.
                        </p>
                      )}
                    </>
                  )}
                </div>
                <p className="scan-popover-hint">
                  Drop an image here or paste from clipboard
                </p>
              </div>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              capture="environment"
              className="scan-file-input"
              onChange={handleScanFile}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="scan-file-input"
              onChange={handleScanFile}
            />
          </div>

          <div className="logo-container">
            <button
              type="button"
              className="logo-button-container"
              onClick={() => navigate("/")}
              aria-label="Go to landing"
            >
              <img className="logo-button" src="/favicon.svg" alt="logo" />
            </button>
          </div>
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
              <button
                type="button"
                key={index}
                className={`month-container ${isActive ? "active-month" : ""}`}
                onClick={() =>
                  setSelectedDay(selectedDay.with({ month: index + 1 }))
                }
                aria-label={`${month} ${selectedDay.year}: ${formatCurrency(data.balance)} net`}
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
              </button>
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
