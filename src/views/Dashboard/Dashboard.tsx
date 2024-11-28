import NavBar from "../../components/Dashboard/NavBar";
import Calendar from "../../components/Dashboard/Calendar";
import Footer from "../../components/Dashboard/Footer";
import { UserType } from "../../types";

interface DashboardProps {
  user: UserType;
  selectedDay: moment.Moment;
  setSelectedDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

function Dashboard({ user, selectedDay, setSelectedDay }: DashboardProps) {
  return (
    <div className="app-main">
      <NavBar selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
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
