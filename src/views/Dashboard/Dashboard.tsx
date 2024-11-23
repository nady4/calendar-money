import NavBar from "../../components/Dashboard/NavBar";
import Calendar from "../../components/Dashboard/Calendar";
import Footer from "../../components/Dashboard/Footer";
import { UserType } from "../../types";

interface DashboardProps {
  user: UserType;
  day: moment.Moment;
  setDay: React.Dispatch<React.SetStateAction<moment.Moment>>;
}

function Dashboard({ user, day, setDay }: DashboardProps) {
  return (
    <div className="app-main">
      <NavBar user={user} day={day} setDay={setDay} />
      <Calendar user={user} day={day} setDay={setDay} />
      <Footer />
    </div>
  );
}

export default Dashboard;
