import MonthLineChart from "../../components/Stats/MonthLineChart";
import YearLineChart from "../../components/Stats/YearLineChart";
import NavBar from "../../components/Dashboard/NavBar";
import Dropdown from "../../components/Dashboard/Dropdown";
import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";

interface StatsProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Stats = ({
  user,
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen,
}: StatsProps) => {
  return (
    <div className="stats-container">
      <Dropdown
        user={user}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />
      <NavBar
        user={user}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        isStatsView={true}
      />
      <MonthLineChart transactions={user.transactions} month="November" />
      <YearLineChart transactions={user.transactions} />
    </div>
  );
};

export default Stats;
