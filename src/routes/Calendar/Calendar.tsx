import React, { useState, useEffect } from "react";
import Day from "../../components/Day/Day";
import { getCalendarDays } from "../../util/calendar";
import "./Calendar.scss";

function Calendar({
  user,
  day,
  setDay,
  setTransaction,
  triggers,
  setTriggers,
}) {
  let [calendarDays, setCalendarDays] = useState([]);
  const weekdays = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  useEffect(() => {
    setCalendarDays(getCalendarDays(day));
  }, [day, user]);

  return (
    <main className="calendar-main">
      <div className="calendar-container">
        <div className="weekday-list">
          {weekdays.map((weekday) => (
            <div className="weekday-item" key={weekday}>
              <p className="weekday">
                {window.innerWidth > 768 ? weekday : weekday.slice(0, 1)}
              </p>
            </div>
          ))}
        </div>
        <div className="calendar">
          {calendarDays.map((calendarDay) => {
            return (
              <Day
                user={user}
                setDay={setDay}
                calendarDay={calendarDay}
                setTransaction={setTransaction}
                triggers={triggers}
                setTriggers={setTriggers}
                key={calendarDay}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Calendar;
