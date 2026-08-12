import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";
import {
  formatCurrency,
  getMonthTotal,
  getUpcomingTransactions
} from "../../util/functions";
import { months } from "../../util/constants";

interface CalendarSummaryProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  onAdd: () => void;
}

const CalendarSummary = ({
  user,
  selectedDay,
  onAdd
}: CalendarSummaryProps) => {
  const monthName = months[selectedDay.month - 1];
  const monthTotal = getMonthTotal(user.transactions, monthName, selectedDay.year);
  const today = Temporal.Now.plainDate("gregory");
  const monthStart = selectedDay.with({ day: 1 });
  const monthComparison = Temporal.PlainDate.compare(monthStart, today);
  const isCurrentMonth =
    monthStart.year === today.year && monthStart.month === today.month;
  const start = Temporal.PlainDate.compare(monthStart, today) > 0 ? monthStart : today;
  const upcoming = getUpcomingTransactions(user.transactions, start, 7, 3).filter(
    (transaction) => {
      const date = transaction.date as Temporal.PlainDate;
      return date.year === selectedDay.year && date.month === selectedDay.month;
    }
  );
  const hasTransactions = user.transactions.length > 0;
  const hasMonthActivity = monthTotal.income > 0 || monthTotal.expenses > 0;
  const upcomingLabel = isCurrentMonth
    ? "Next seven days"
    : monthComparison > 0
      ? "First seven days"
      : "Future entries";

  return (
    <section className="calendar-summary" aria-labelledby="calendar-summary-title">
      <div className="calendar-summary-copy">
        <p className="calendar-summary-kicker">Your month</p>
        <h1 id="calendar-summary-title">What&apos;s coming in {monthName}?</h1>
        <p className="calendar-summary-lede">
          {hasMonthActivity
            ? `${monthName} has ${formatCurrency(monthTotal.income)} coming in and ${formatCurrency(
                monthTotal.expenses
              )} going out on your calendar.`
            : hasTransactions
              ? `${monthName} is clear so far. Add what has happened or what is coming next.`
              : "Your calendar is clear. Add what has happened or what is coming next."}
        </p>
      </div>

      <div className="calendar-summary-stats" aria-label={`${monthName} totals`}>
        <div className="calendar-summary-stat">
          <span>Coming in</span>
          <strong className="is-income">+${formatCurrency(monthTotal.income)}</strong>
        </div>
        <div className="calendar-summary-stat">
          <span>Going out</span>
          <strong className="is-expense">-${formatCurrency(monthTotal.expenses)}</strong>
        </div>
        <div className="calendar-summary-stat calendar-summary-net">
          <span>Net this month</span>
          <strong className={monthTotal.balance >= 0 ? "is-positive" : "is-negative"}>
            {monthTotal.balance >= 0 ? "+" : "-"}${formatCurrency(Math.abs(monthTotal.balance))}
          </strong>
        </div>
      </div>

      <div className="calendar-summary-action">
        <div className="calendar-upcoming">
          <p className="calendar-upcoming-label">{upcomingLabel}</p>
          {upcoming.length > 0 ? (
            <div className="calendar-upcoming-list">
              {upcoming.map((transaction) => {
                const date = transaction.date as Temporal.PlainDate;
                const isIncome = transaction.category.type === "Income";
                return (
                  <span className="calendar-upcoming-item" key={transaction._id}>
                    <span
                      className="calendar-upcoming-dot"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                    <span className="calendar-upcoming-description">
                      {transaction.description}
                    </span>
                    <span className={isIncome ? "is-income" : "is-expense"}>
                      {isIncome ? "+" : "-"}${formatCurrency(transaction.amount)}
                    </span>
                    <span className="calendar-upcoming-date">
                      {date.toLocaleString("en", { month: "short", day: "numeric" })}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="calendar-upcoming-empty">
              {isCurrentMonth
                ? "Nothing else is scheduled in the next seven days."
                : monthComparison > 0
                  ? "Nothing is scheduled in the first seven days yet."
                  : "No future entries are scheduled in this month."}
            </p>
          )}
        </div>
        <button type="button" className="calendar-add-button" onClick={onAdd}>
          Add to calendar
        </button>
      </div>
    </section>
  );
};

export default CalendarSummary;
