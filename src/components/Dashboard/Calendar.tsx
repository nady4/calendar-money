import { useEffect, useState, memo, useRef } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";
import { weekdays } from "../../util/constants";
import {
  useStartOnMonday,
  getGridStartOffset,
  getWeekdayLabel
} from "../../util/weekStart";
import Day from "../Day/Day";
import "../../util/dragState";
import "../../styles/Calendar.scss";

interface CalendarProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
}

function Calendar({ user, setUser, selectedDay, setSelectedDay }: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Temporal.PlainDate[]>([]);
  const [startOnMonday] = useStartOnMonday();
  const draggedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const days: Temporal.PlainDate[] = [];
    const firstDayOfMonth = selectedDay.with({ day: 1 });
    const offset = getGridStartOffset(firstDayOfMonth.dayOfWeek, startOnMonday);
    const daysInMonth = firstDayOfMonth.daysInMonth;
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
    let day = firstDayOfMonth.subtract({ days: offset });

    for (let i = 0; i < totalCells; i++) {
      days.push(day);
      day = day.add({ days: 1 });
    }

    setCalendarDays(days);
  }, [selectedDay, startOnMonday]);

  return (
    <main className="calendar-main">
      <div className="calendar-container">
        <div className="weekday-list">
          {weekdays.map((_, index) => {
            const label = getWeekdayLabel(startOnMonday, index);
            return (
              <div className="weekday-item" key={label}>
                <p className="weekday">
                  <span className="weekday-full">{label}</span>
                  <span className="weekday-short">{label.slice(0, 1)}</span>
                </p>
              </div>
            );
          })}
        </div>
        <div className="calendar">
          {calendarDays.map((calendarDay) => {
            return (
              <Day
                date={calendarDay}
                user={user}
                setUser={setUser}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                key={calendarDay.toString()}
                draggedIdRef={draggedIdRef}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default memo(Calendar);
