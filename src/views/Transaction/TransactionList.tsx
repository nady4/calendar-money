import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Transaction from "../../components/Transaction/Transaction";
import { getTransactionsFromDay } from "../../util/transactions";
import { UserType, TransactionType } from "../../types";
import exitButton from "../../assets/whiteExitButton.svg";
import "../../styles/list.scss";

interface TransactionListProps {
  user: UserType;
  selectedDay: moment.Moment;
  setSelectedDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
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
    setDayTransactions(getTransactionsFromDay(user.transactions, selectedDay));
  }, [selectedDay, user.transactions]);

  const handleCloseButton = () => {
    setSelectedTransaction(null);
    setSelectedDay(moment());
    navigate("/dashboard");
  };

  return (
    <div className="list">
      <h2>{selectedDay.format("DD-MM")}</h2>
      <button className="exit-button" onClick={handleCloseButton}>
        <img src={exitButton} className="exit-button-logo" />
      </button>
      <div className="day-view-header">
        <div className="day-view-buttons">
          <div className="day-change-buttons-container">
            <button
              className="day-change-button next-day-button"
              onClick={() => {
                setSelectedDay(moment(selectedDay).subtract(1, "days"));
              }}
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="day-change-button previous-day-button"
              onClick={() => {
                setSelectedDay(moment(selectedDay).add(1, "days"));
              }}
            >
              <ChevronRightIcon />
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
      <div className="new-button-container">
        <button
          className="new-button"
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
