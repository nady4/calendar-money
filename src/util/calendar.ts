import moment from "moment/moment";

const getCalendarDays = (date: moment.Moment) => {
  let firstDay = moment(date).startOf("month").startOf("week");
  const lastDay = moment(date).endOf("month").endOf("week");
  const daysInCalendar = lastDay.diff(firstDay, "days") + 1;
  const days = [];

  for (let i = 0; i < daysInCalendar; i++) {
    days.push(firstDay);
    firstDay = moment(firstDay).add(1, "days");
  }
  return days;
};

export { getCalendarDays };
