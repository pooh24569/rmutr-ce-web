// frontend/src/utils/dateUtils.js

export const formatDate = (date, format = "YYYY-MM-DD") => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
  if (format === "DD/MM/YYYY") return `${day}/${month}/${year}`;
  if (format === "MMM DD, YYYY") {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getMonth()]} ${day}, ${year}`;
  }

  return `${year}-${month}-${day}`;
};

export const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isToday = (date) => {
  return isSameDay(date, new Date());
};

export const getMonthName = (month) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const getMonthRange = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  return { startDate, endDate };
};
