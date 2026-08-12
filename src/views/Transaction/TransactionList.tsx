import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import {
  formatCurrency,
  getDayActivity,
  getDayTotal,
  getDayTransactions
} from "../../util/functions";
import { UserType, TransactionType } from "../../types";
import Transaction from "../../components/Transaction/Transaction";
import LeftIcon from "@mui/icons-material/ChevronLeft";
import RightIcon from "@mui/icons-material/ChevronRight";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/list.scss";

interface TransactionListProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  setSelectedTransaction: React.Dispatch<
    React.SetStateAction<TransactionType | null>
  >;
}

function TransactionList({
  user,
  selectedDay,
  setSelectedDay,
  setSelectedTransaction,
}: TransactionListProps) {
  const [dayTransactions, setDayTransactions] = useState<TransactionType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setDayTransactions(getDayTransactions(user.transactions, selectedDay));
  }, [selectedDay, user.transactions]);

  const activity = getDayActivity(user.transactions, selectedDay);
  const runningTotal = getDayTotal(user.transactions, selectedDay);
  const today = Temporal.Now.plainDate("gregory");
  const isFuture = Temporal.PlainDate.compare(selectedDay, today) > 0;
  const isPast = Temporal.PlainDate.compare(selectedDay, today) < 0;
  const dayDescription =
    dayTransactions.length === 0
      ? isFuture
        ? "Nothing planned for this day yet. Add what’s coming next."
        : "Nothing recorded for this day."
      : `${dayTransactions.length} ${dayTransactions.length === 1 ? "entry" : "entries"} ${
          isFuture ? "are coming up" : isPast ? "were recorded" : "are on the calendar"
        }.`;

  return (
    <div className="list">
      <div className="list-heading">
        <p className="list-kicker">{isFuture ? "Coming up" : isPast ? "Recorded" : "Today"}</p>
        <h2>
          {selectedDay.toLocaleString("en", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        </h2>
        <p className="list-description">{dayDescription}</p>
      </div>
      <button
        type="button"
         aria-label="Back to calendar"
        className="exit-button"
        onClick={() => {
          setSelectedTransaction(null);
           navigate("/dashboard");
        }}
      >
        <img src={exitButton} alt="" />
      </button>
      <div className="day-view-header">
        <div className="day-view-buttons">
          <div className="day-change-buttons-container">
            <button
              className="day-change-button next-day-button"
              onClick={() => {
                setSelectedDay(selectedDay.subtract({ days: 1 }));
              }}
            >
              <LeftIcon />
            </button>
            <button
              className="day-change-button previous-day-button"
              onClick={() => {
                setSelectedDay(selectedDay.add({ days: 1 }));
              }}
            >
              <RightIcon />
            </button>
          </div>
        </div>
      </div>
      <div className="day-story" aria-label="Day summary">
        <div>
          <span>Coming in</span>
          <strong className="is-income">+${formatCurrency(activity.income)}</strong>
        </div>
        <div>
          <span>Going out</span>
          <strong className="is-expense">-${formatCurrency(activity.expenses)}</strong>
        </div>
        <div>
          <span>Running total after this day</span>
          <strong className={runningTotal.balance >= 0 ? "is-positive" : "is-negative"}>
            {runningTotal.balance >= 0 ? "+" : "-"}${formatCurrency(Math.abs(runningTotal.balance))}
          </strong>
        </div>
      </div>
      <div className="add-button">
        <button
          className="add"
          onClick={() => {
            navigate("/new-transaction");
          }}
        >
           Add to calendar
        </button>
      </div>
      <div className="items-container">
        {dayTransactions.map((transaction) => {
          return (
            <button
              type="button"
              key={transaction._id}
              className="item"
              onClick={() => {
                setSelectedTransaction(transaction);
                navigate("/edit-transaction");
              }}
            >
              <Transaction transaction={transaction} />
            </button>
          );
        })}
        {dayTransactions.length === 0 && (
          <div className="list-empty-state">
            <p>{isFuture ? "Your calendar is open here." : "This day is clear."}</p>
            <span>Add an entry if you want to remember what happened or plan what’s next.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionList;
