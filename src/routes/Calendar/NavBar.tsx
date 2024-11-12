import React from "react";
import moment from "moment/moment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getBalanceByDay } from "../../util/balance";
import "./NavBar.scss";

const NavBar = ({ user, setUser, day, setDay, triggers, setTriggers }) => {
  const handleLeftArrowClick = () => {
    setDay(moment(day).subtract(1, "months"));
  };

  const handleRightArrowClick = () => {
    setDay(moment(day).add(1, "months"));
  };
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    setUser({});
  };
  const handleCategoriesClick = () => {
    setTriggers({ ...triggers, categoryList: true });
  };

  return (
    <div className="navbar">
      <div className="logo-container" onClick={() => window.location.reload()}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
            fill="#333"
          />
        </svg>
      </div>
      <div className="user-data-container">
        <div className="today-date-container">
          <p className="today-date">{moment().format("DD MMM")}</p>
        </div>
        <div className="user-balance-container">
          <p className="user-balance">
            ${getBalanceByDay(user.transactions, day)}
          </p>
        </div>
      </div>
      <div className="date-change-container">
        <button className="left-arrow" onClick={handleLeftArrowClick}>
          <ChevronLeftIcon fontSize="small" />
        </button>
        <div className="date-container">
          <p className="date">{day.format("MM-YYYY")}</p>
        </div>
        <button className="right-arrow" onClick={handleRightArrowClick}>
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>
      <div className="categories-button-container">
        <button className="categories-button" onClick={handleCategoriesClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18px"
            height="18px"
            viewBox="0 0 18 18"
            version="1.1"
          >
            <g
              id="Icons"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
            >
              <g id="Outlined" transform="translate(-749.000000, -1263.000000)">
                <g
                  id="Communication"
                  transform="translate(100.000000, 1162.000000)"
                >
                  <g
                    id="Outlined-/-Communication-/-list_alt"
                    transform="translate(646.000000, 98.000000)"
                  >
                    <g>
                      <polygon id="Path" points="0 0 24 0 24 24 0 24" />
                      <path
                        d="M11,7 L17,7 L17,9 L11,9 L11,7 Z M11,11 L17,11 L17,13 L11,13 L11,11 Z M11,15 L17,15 L17,17 L11,17 L11,15 Z M7,7 L9,7 L9,9 L7,9 L7,7 Z M7,11 L9,11 L9,13 L7,13 L7,11 Z M7,15 L9,15 L9,17 L7,17 L7,15 Z M20.1,3 L3.9,3 C3.4,3 3,3.4 3,3.9 L3,20.1 C3,20.5 3.4,21 3.9,21 L20.1,21 C20.5,21 21,20.5 21,20.1 L21,3.9 C21,3.4 20.5,3 20.1,3 Z M19,19 L5,19 L5,5 L19,5 L19,19 Z"
                        id="🔹-Icon-Color"
                        fill="#1D1D1D"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </button>
      </div>

      <div className="logout-container">
        <button className="logout-button" onClick={handleLogoutClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="512"
            height="512"
            viewBox="0 0 512 512"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M84.9407 448.942C78.6923 455.19 68.5616 455.19 62.3132 448.942C56.0649 442.693 56.0649 432.563 62.3132 426.314L233 255.628L62.3132 84.9417C56.0649 78.6933 56.0649 68.5626 62.3132 62.3142C68.5616 56.0658 78.6923 56.0658 84.9407 62.3142L255.627 233.001L426.313 62.3142C432.562 56.0658 442.692 56.0658 448.941 62.3142C455.189 68.5626 455.189 78.6933 448.941 84.9417L278.254 255.628L448.941 426.314C455.189 432.563 455.189 442.693 448.941 448.942C442.692 455.19 432.562 455.19 426.313 448.942L255.627 278.255L84.9407 448.942Z"
              fill="black"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
