import { Temporal } from "@js-temporal/polyfill";
import { months } from "../../util/constants";

interface PeriodNavigatorProps {
  scope: "month" | "year";
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
}

const PeriodNavigator = ({
  scope,
  selectedDay,
  setSelectedDay
}: PeriodNavigatorProps) => {
  const handlePrev = () => {
    setSelectedDay(
      scope === "month"
        ? selectedDay.subtract({ months: 1 })
        : selectedDay.subtract({ years: 1 })
    );
  };

  const handleNext = () => {
    setSelectedDay(
      scope === "month"
        ? selectedDay.add({ months: 1 })
        : selectedDay.add({ years: 1 })
    );
  };

  const label =
    scope === "month"
      ? `${months[selectedDay.month - 1]} ${selectedDay.year}`
      : `${selectedDay.year}`;

  return (
    <div className="period-nav">
      <button className="period-arrow" onClick={handlePrev} aria-label="Previous">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="period-label" title="Active period">
        <span className="period-label-main">{label}</span>
      </div>

      <button className="period-arrow" onClick={handleNext} aria-label="Next">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

export default PeriodNavigator;