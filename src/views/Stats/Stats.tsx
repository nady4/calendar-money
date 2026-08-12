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
  getYearCategoryBreakdown,
  getMonthTotals,
  getYearTotals,
  formatCurrency
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

  const totals =
    scope === "month"
      ? getMonthTotals(user.transactions, months[selectedDay.month - 1], selectedDay.year)
      : getYearTotals(user.transactions, selectedDay.year);
  const previousDate =
    scope === "month"
      ? selectedDay.subtract({ months: 1 })
      : selectedDay.subtract({ years: 1 });
  const previousTotals =
    scope === "month"
      ? getMonthTotals(
          user.transactions,
          months[previousDate.month - 1],
          previousDate.year
        )
      : getYearTotals(user.transactions, previousDate.year);
  const periodLabel =
    scope === "month"
      ? `${months[selectedDay.month - 1]} ${selectedDay.year}`
      : `${selectedDay.year}`;
  const biggestExpense = breakdown.expenses[0];
  const story =
    totals.income === 0 && totals.expenses === 0
      ? `There isn’t enough activity in ${periodLabel} to tell a story yet.`
      : biggestExpense
        ? `Most of your spending in ${periodLabel} went to ${biggestExpense.name}: $${formatCurrency(
            biggestExpense.total
          )}.`
        : `You have ${totals.balance >= 0 ? "+" : "-"}$${formatCurrency(
            Math.abs(totals.balance)
          )} net activity recorded in ${periodLabel}.`;
  const comparison =
    previousTotals.expenses > 0
      ? `You spent ${totals.expenses >= previousTotals.expenses ? "more" : "less"} than the previous ${scope}.`
      : "The chart below shows how money moved through this period.";

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
        <section className="stats-intro" aria-labelledby="stats-intro-title">
          <div>
            <p className="stats-intro-kicker">A clearer look at your money</p>
            <h1 id="stats-intro-title">What changed in {periodLabel}?</h1>
            <p>{story}</p>
            <span>{comparison}</span>
          </div>
        </section>
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
            title="Where it went"
          />
          <CategoryDonut
            breakdown={breakdown}
            type="Income"
            title="Where it came from"
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
