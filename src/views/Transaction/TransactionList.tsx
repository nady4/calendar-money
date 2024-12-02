import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { getDayTransactions } from "../../util/functions";
import { UserType, TransactionType } from "../../types";
import Transaction from "../../components/Transaction/Transaction";
import LeftIcon from "@mui/icons-material/ChevronLeft";
import RightIcon from "@mui/icons-material/ChevronRight";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/list.scss";

interface TransactionListProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  setSelectedTransaction: React.Dispatch<
    React.SetStateAction<TransactionType | null>
  >;
}

function TransactionList({
  user,
  selectedDay,
  setSelectedDay,
  setSelectedTransaction,
}: TransactionListProps) {
  const [dayTransactions, setDayTransactions] = useState<TransactionType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setDayTransactions(getDayTransactions(user.transactions, selectedDay));
  }, [selectedDay, user.transactions]);

  return (
    <div className="list">
      <h2>
        {selectedDay.toLocaleString("en", { month: "long", day: "numeric" })}
      </h2>
      <img
        src={exitButton}
        className="exit-button"
        onClick={() => {
          setSelectedTransaction(null);
          setSelectedDay(Temporal.Now.plainDate("gregory"));
          navigate("/dashboard");
        }}
      />
      <div className="day-view-header">
        <div className="day-view-buttons">
          <div className="day-change-buttons-container">
            <button
              className="day-change-button next-day-button"
              onClick={() => {
                setSelectedDay(selectedDay.subtract({ days: 1 }));
              }}
            >
              <LeftIcon />
            </button>
            <button
              className="day-change-button previous-day-button"
              onClick={() => {
                setSelectedDay(selectedDay.add({ days: 1 }));
              }}
            >
              <RightIcon />
            </button>
          </div>
        </div>
      </div>
      <div className="items-container">
        {dayTransactions.map((transaction, index) => {
          return (
            <div
              key={index}
              className="item"
              onClick={() => {
                setSelectedTransaction(transaction);
                navigate("/edit-transaction");
              }}
            >
              <Transaction transaction={transaction} key={index} />
            </div>
          );
        })}
      </div>
      <div className="link-button">
        <button
          className="link"
          onClick={() => {
            navigate("/new-transaction");
          }}
        >
          Add new transaction
        </button>
      </div>
    </div>
  );
}

export default TransactionList;
