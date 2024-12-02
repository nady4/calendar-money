import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { UserType } from "../../types";
import Dropdown from "../../components/Dashboard/Dropdown";
import NavBar from "../../components/Dashboard/NavBar";
import Calendar from "../../components/Dashboard/Calendar";
import Footer from "../../components/Dashboard/Footer";

interface DashboardProps {
  user: UserType;
  selectedDay: Temporal.PlainDate;
  setSelectedDay: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
}

function Dashboard({ user, selectedDay, setSelectedDay }: DashboardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="app-main">
      <Dropdown user={user} isDropdownOpen={isDropdownOpen} />
      <NavBar
        user={user}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />
      <Calendar
        user={user}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />
      <Footer />
    </div>
  );
}

export default Dashboard;
