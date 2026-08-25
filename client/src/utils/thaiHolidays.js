

export const thaiHolidays = {

  "01-01": "วันขึ้นปีใหม่",
  "02-14": "วันวาเลนไทน์",
  "04-06": "วันจักรี",
  "04-13": "วันสงกรานต์",
  "04-14": "วันสงกรานต์",
  "04-15": "วันสงกรานต์",
  "05-01": "วันแรงงานแห่งชาติ",
  "05-04": "วันฉัตรมงคล",
  "06-03": "วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสุทิดา",
  "07-28": "วันเฉลิมพระชนมพรรษา ร.10",
  "08-12": "วันแม่แห่งชาติ",
  "10-13": "วันคล้ายวันสวรรคต ร.9",
  "10-23": "วันปิยมหาราช",
  "12-05": "วันพ่อแห่งชาติ",
  "12-10": "วันรัฐธรรมนูญ",
  "12-31": "วันสิ้นปี",
};

export const thaiHolidays2025 = {

  "02-12": "วันมาฆบูชา",

  "05-11": "วันวิสาขบูชา",

  "07-11": "วันเข้าพรรษา",

  "07-10": "วันอาสาฬหบูชา",

  "10-07": "วันออกพรรษา",
};

export const thaiHolidays2026 = {

  "03-03": "วันมาฆบูชา",

  "05-31": "วันวิสาขบูชา",

  "07-30": "วันเข้าพรรษา",

  "07-29": "วันอาสาฬหบูชา",

  "10-26": "วันออกพรรษา",
};

export const getHolidayName = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const key = `${month}-${day}`;
  const year = date.getFullYear();

  if (thaiHolidays[key]) {
    return thaiHolidays[key];
  }

  if (year === 2025 && thaiHolidays2025[key]) {
    return thaiHolidays2025[key];
  }
  if (year === 2026 && thaiHolidays2026[key]) {
    return thaiHolidays2026[key];
  }

  return null;
};

export const isHoliday = (date) => {
  return getHolidayName(date) !== null;
};

export const getHolidaysForMonth = (year, month) => {
  const holidays = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const holidayName = getHolidayName(date);
    if (holidayName) {
      holidays.push({
        date,
        name: holidayName,
        type: "holiday",
      });
    }
  }

  return holidays;
};

export default {
  thaiHolidays,
  getHolidayName,
  isHoliday,
  getHolidaysForMonth,
};
