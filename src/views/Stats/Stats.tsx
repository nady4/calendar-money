import KpiHero from "../../components/Stats/KpiHero";
import CashFlowChart from "../../components/Stats/CashFlowChart";
import CategoryDonut from "../../components/Stats/CategoryDonut";
import RankedCategories from "../../components/Stats/RankedCategories";
import NotableTransactions from "../../components/Stats/NotableTransactions";
import NetWorthChart from "../../components/Stats/NetWorthChart";
import PeriodNavigator from "../../components/Stats/PeriodNavigator";
import NavBar from "../../components/Dashboard/NavBar";
import Dropdown from "../../components/Dashboard/Dropdown";
import { Temporal } from "@js-temporal/polyfill";
import { UserType, TransactionType } from "../../types";
import {
  getMonthCategoryBreakdown,
  getYearCategoryBreakdown
} from "../../util/functions";
import { months } from "../../util/constants";
import { useState } from "react";
import "../../styles/Stats.scss";

interface StatsProps {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTransaction: React.Dispatch<
    React.SetStateAction<TransactionType | null>
  >;
}

const Stats = ({
  user,
  setUser,
  selectedDay,
  setSelectedDay,
  isDropdownOpen,
  setIsDropdownOpen,
  setSelectedTransaction
}: StatsProps) => {
  const [scope, setScope] = useState<"month" | "year">("month");

  const breakdown =
    scope === "month"
      ? getMonthCategoryBreakdown(
          user.transactions,
          user.categories,
          months[selectedDay.month - 1],
          selectedDay.year
        )
      : getYearCategoryBreakdown(
          user.transactions,
          user.categories,
          selectedDay.year
        );

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
        setSelectedTransaction={setSelectedTransaction}
      />

      <div className="stats-container">
        <div className="stats-controls">
          <PeriodNavigator
            scope={scope}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
          <div className="stats-scope-toggle">
            <button
              className={scope === "month" ? "scope-btn active" : "scope-btn"}
              onClick={() => setScope("month")}
            >
              Month
            </button>
            <button
              className={scope === "year" ? "scope-btn active" : "scope-btn"}
              onClick={() => setScope("year")}
            >
              Year
            </button>
          </div>
        </div>

        <KpiHero
          transactions={user.transactions}
          selectedDay={selectedDay}
          scope={scope}
        />

        <div className="stats-row stats-row-wide">
          <CashFlowChart
            transactions={user.transactions}
            selectedDay={selectedDay}
            scope={scope}
          />
        </div>

        <div className="stats-row stats-row-split">
          <CategoryDonut
            breakdown={breakdown}
            type="Expense"
            title="Expenses by Category"
          />
          <CategoryDonut
            breakdown={breakdown}
            type="Income"
            title="Income by Category"
          />
        </div>

        <div className="stats-row stats-row-split">
          <RankedCategories breakdown={breakdown} />
          <NotableTransactions
            transactions={user.transactions}
            selectedDay={selectedDay}
            scope={scope}
            setSelectedTransaction={setSelectedTransaction}
          />
        </div>

        <div className="stats-row stats-row-wide">
          <NetWorthChart transactions={user.transactions} />
        </div>
      </div>
    </div>
  );
};

export default Stats;