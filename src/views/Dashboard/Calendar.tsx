import { useState, useEffect } from "react";
import Day from "../../components/Day/Day";
import { getCalendarDays } from "../../util/calendar";
import { UserType } from "../../types";
import "./Calendar.scss";

interface CalendarProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  day: moment.Moment;
  setDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

function Calendar({ user, setUser, day, setDay }: CalendarProps) {
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
                setUser={setUser}
                setDay={setDay}
                calendarDay={calendarDay}
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
