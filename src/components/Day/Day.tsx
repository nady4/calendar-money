import { useState, useEffect, memo, useRef, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { toast } from "react-toastify";
import {
  getDayTotal,
  getDayTransactions,
  formatCurrency,
  formatDayBalance
} from "../../util/functions";
import { updateTransactionDate } from "../../util/transactionApi";
import { UserType, TransactionType } from "../../types.d";
import { justDropped } from "../../util/dragState";
import "../../styles/Day.scss";

interface DayProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  date: Temporal.PlainDate;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  draggedIdRef: React.MutableRefObject<string | null>;
}

function Day({
  date,
  user,
  setUser,
  selectedDay,
  setSelectedDay,
  draggedIdRef
}: DayProps) {
  const [total, setTotal] = useState<{
    income: number;
    expenses: number;
    balance: number;
  }>({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const today = Temporal.Now.plainDate("gregory");
  const isActiveMonth =
    selectedDay.year === date.year && selectedDay.month === date.month;
  const isActiveDay = date.equals(today);
  const isSelectedDay = date.equals(selectedDay);
  const navigate = useNavigate();
  const dragCounter = useRef(0);

  useEffect(() => {
    setTransactions(getDayTransactions(user.transactions, date));
    setTotal(getDayTotal(user.transactions, date));
  }, [date, user.transactions]);

  const openTransactions = () => {
    if (draggedIdRef.current) return;
    if (justDropped.isRecent()) return;
    setSelectedDay(date);
    navigate("/transactions");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openTransactions();
    }
  };

  const handleItemDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    draggedIdRef.current = id;
    setDraggingId(id);
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {
      /* no-op */
    }
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };

  const handleItemDragEnd = () => {
    draggedIdRef.current = null;
    setDraggingId(null);
    setIsDragOver(false);
    dragCounter.current = 0;
    justDropped.mark();
  };

  const handleDayDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!draggedIdRef.current) return;
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragOver(true);
  };

  const handleDayDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!draggedIdRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDayDragLeave = () => {
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDayDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);

    const id = draggedIdRef.current;
    draggedIdRef.current = null;
    setDraggingId(null);
    if (!id) return;

    const source = user.transactions.find((t) => t._id === id);
    if (!source) return;
    const srcDate =
      typeof source.date === "string"
        ? Temporal.PlainDate.from(source.date.split("T")[0])
        : (source.date as Temporal.PlainDate);
    if (srcDate.equals(date)) return;

    const updated = await updateTransactionDate(
      user.id,
      id,
      date,
      localStorage.getItem("token")
    );
    if (updated) {
      setUser(updated);
      toast.success(
        `Moved to ${date.toLocaleString("en", { month: "long", day: "numeric" })}.`
      );
    } else {
      toast.error("We couldn’t move that entry. Try again.");
    }
  };

  const visibleTransactions = transactions.slice(0, 4);
  const remainingCount = Math.max(
    0,
    transactions.length - visibleTransactions.length
  );
  const dayLabel = date.toLocaleString("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div
      className={`${isActiveDay ? "active-day" : "inactive-day"}
        ${isActiveMonth ? "active-month" : "inactive-month"} ${
          total.balance < 0 ? "negative" : "positive"
        } ${isSelectedDay ? "selected-day" : ""} calendar-day ${isDragOver ? "drag-over" : ""}`}
      onClick={openTransactions}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-current={isActiveDay ? "date" : undefined}
      aria-label={`${dayLabel}. ${
        transactions.length === 0
          ? "Nothing planned."
          : `${transactions.length} ${transactions.length === 1 ? "entry" : "entries"}.`
      } Running total ${formatCurrency(total.balance)} dollars.`}
      onDragEnter={handleDayDragEnter}
      onDragOver={handleDayDragOver}
      onDragLeave={handleDayDragLeave}
      onDrop={handleDayDrop}
    >
      <div className="day-header">
        <div className="day-balance-container">
          <p className="day-balance">${formatDayBalance(total.balance)}</p>
        </div>
        <div className="day-date-container">
          <p className="day-date">{date.day}</p>
        </div>
      </div>
      {transactions.length === 0 && (
        <div className="day-activity day-activity-empty" aria-hidden="true">
          quiet
        </div>
      )}
      <div className="transactions-container">
        {visibleTransactions.map((transaction: TransactionType) => {
          return (
            <div
              className={`day-item ${
                draggingId === transaction._id ? "is-dragging" : ""
              }`}
              key={transaction._id}
              draggable
              onDragStart={(e) => handleItemDragStart(e, transaction._id)}
              onDragEnd={handleItemDragEnd}
              title={transaction.description}
            >
              <div
                className="item-color"
                style={{
                  backgroundColor: transaction.category.color
                }}
              ></div>
              <div className="item-amount">
                {transaction.category.type === "Income" ? "+" : "-"}$
                {formatCurrency(transaction.amount)}
              </div>
              <div className="item-description">{transaction.description}</div>
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div className="day-more">+{remainingCount} more</div>
        )}
      </div>
    </div>
  );
}

export default memo(Day);
