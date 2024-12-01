import { useState, useEffect } from "react";
import moment from "moment";
import Day from "../Day/Day";
import { UserType } from "../../types";
import "../../styles/Calendar.scss";

interface CalendarProps {
  user: UserType;
  selectedDay: moment.Moment;
  setSelectedDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

function Calendar({ user, selectedDay, setSelectedDay }: CalendarProps) {
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
    const days = [];
    let day = moment(selectedDay).startOf("month").startOf("week");

    for (let i = 0; i < 35; i++) {
      days.push(moment(day));
      day = moment(day).add(1, "days");
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
                key={calendarDay.format("DD-MM-YYYY")}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Calendar;
