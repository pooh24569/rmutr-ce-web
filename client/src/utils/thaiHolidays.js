// Thai Public Holidays
// วันหยุดราชการไทย

export const thaiHolidays = {
  // Format: "MM-DD": "Holiday Name"
  // วันหยุดประจำปี (Fixed Date)
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

// วันหยุดที่เปลี่ยนแปลงตามปฏิทินจันทรคติ (ต้องอัปเดตทุกปี)
export const thaiHolidays2025 = {
  // วันมาฆบูชา
  "02-12": "วันมาฆบูชา",
  // วันวิสาขบูชา
  "05-11": "วันวิสาขบูชา",
  // วันเข้าพรรษา
  "07-11": "วันเข้าพรรษา",
  // วันอาสาฬหบูชา
  "07-10": "วันอาสาฬหบูชา",
  // วันออกพรรษา
  "10-07": "วันออกพรรษา",
};

export const thaiHolidays2026 = {
  // วันมาฆบูชา
  "03-03": "วันมาฆบูชา",
  // วันวิสาขบูชา
  "05-31": "วันวิสาขบูชา",
  // วันเข้าพรรษา
  "07-30": "วันเข้าพรรษา",
  // วันอาสาฬหบูชา
  "07-29": "วันอาสาฬหบูชา",
  // วันออกพรรษา
  "10-26": "วันออกพรรษา",
};

/**
 * Get holiday name for a specific date
 * @param {Date} date - The date to check
 * @returns {string|null} Holiday name or null
 */
export const getHolidayName = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const key = `${month}-${day}`;
  const year = date.getFullYear();

  // Check fixed holidays first
  if (thaiHolidays[key]) {
    return thaiHolidays[key];
  }

  // Check year-specific holidays
  if (year === 2025 && thaiHolidays2025[key]) {
    return thaiHolidays2025[key];
  }
  if (year === 2026 && thaiHolidays2026[key]) {
    return thaiHolidays2026[key];
  }

  return null;
};

/**
 * Check if a date is a Thai public holiday
 * @param {Date} date - The date to check
 * @returns {boolean}
 */
export const isHoliday = (date) => {
  return getHolidayName(date) !== null;
};

/**
 * Get all holidays for a specific month
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {Array} Array of holiday objects
 */
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
