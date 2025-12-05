// frontend/src/hooks/useCalendar.js
import { useState, useMemo, useCallback } from "react";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthRange,
  addMonths,
} from "@/utils/dateUtils";


export function useCalendar(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar cells (42 cells = 6 rows × 7 days)
  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const cells = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      cells.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  // Month range for API queries
  const monthRange = useMemo(() => {
    return getMonthRange(year, month);
  }, [year, month]);

  // Navigation
  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, -1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    currentDate,
    year,
    month,
    calendarCells,
    monthRange,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
  };
}