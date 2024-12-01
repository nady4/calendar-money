import { useState, useEffect } from "react";
import { Temporal } from "@js-temporal/polyfill";
import Day from "../Day/Day";
import { UserType } from "../../types";
import "../../styles/Calendar.scss";

interface CalendarProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
}

function Calendar({ user, selectedDay, setSelectedDay }: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Temporal.PlainDate[]>([]);
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
    const days = [];
    let day = selectedDay
      .with({ day: 1 })
      .subtract({ days: selectedDay.with({ day: 1 }).dayOfWeek - 1 });

    for (let i = 0; i < 35; i++) {
      days.push(day);
      day = day.add({ days: 1 });
    }

    setCalendarDays(days);
  }, [selectedDay, user.transactions]);

  return (
    <main className="calendar-main">
      <div className="gradient-border-top"></div>
      <div className="calendar-container">
        <div className="weekday-list">
          {weekdays.map((weekday) => (
            <div className="weekday-item" key={weekday}>
              <p className="weekday">
                {window.innerWidth > 600 ? weekday : weekday.slice(0, 1)}
              </p>
            </div>
          ))}
        </div>
        <div className="calendar">
          {calendarDays.map((calendarDay) => {
            return (
              <Day
                date={calendarDay}
                user={user}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                key={calendarDay.toString()}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Calendar;
