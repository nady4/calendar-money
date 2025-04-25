import MonthLineChart from "../../components/Stats/MonthLineChart";
import YearLineChart from "../../components/Stats/YearLineChart";
import MonthBarChart from "../../components/Stats/MonthBarChart";
import YearBarChart from "../../components/Stats/YearBarChart";
import NavBar from "../../components/Dashboard/NavBar";
import Dropdown from "../../components/Dashboard/Dropdown";
import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";
import "../../styles/Stats.scss";

interface StatsProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Stats = ({
  user,
  setUser,
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen,
}: StatsProps) => {
  return (
    <div className="stats-view">
      <Dropdown
        user={user}
        setUser={setUser}
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
      <div className="stats-container">
        <div className="stat">
          <MonthLineChart
            transactions={user.transactions}
            selectedDay={selectedDay}
          />
        </div>
        <div className="stat">
          <YearLineChart
            transactions={user.transactions}
            selectedDay={selectedDay}
          />
        </div>
        <div className="stat">
          <MonthBarChart
            transactions={user.transactions}
            categories={user.categories}
            selectedDay={selectedDay}
          />
        </div>
        <div className="stat">
          <YearBarChart
            transactions={user.transactions}
            categories={user.categories}
            selectedYear={selectedDay.year}
          />
        </div>
      </div>
    </div>
  );
};

export default Stats;
