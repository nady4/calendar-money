import { useState, useEffect } from "react";
import Day from "../Day/Day";
import { getCalendarDays } from "../../util/calendar";
import { UserType } from "../../types";
import "../../styles/Calendar.scss";

interface CalendarProps {
  user: UserType;
  day: moment.Moment;
  setDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

function Calendar({ user, day, setDay }: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<moment.Moment[]>([]);
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
                day={calendarDay}
                setDay={setDay}
                key={calendarDay.format("YYYY-MM-DD")}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Calendar;
