import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const MOBILE_BREAKPOINT = 1024; // lg breakpoint

/**
 * useSidebar — Custom hook จัดการ sidebar state สำหรับ responsive layout
 *
 * คืนค่า:
 *   isMobile  — true เมื่อจอเล็กกว่า 1024px
 *   isOpen    — true เมื่อ sidebar เปิดอยู่ (mobile only)
 *   open      — เปิด sidebar
 *   close     — ปิด sidebar
 *   toggle    — สลับเปิด/ปิด sidebar
 */
export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const location = useLocation();

  // ตรวจจับขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // ถ้าย้ายไป desktop → ปิด overlay อัตโนมัติ
      if (!mobile) setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ปิด sidebar เมื่อเปลี่ยน route (mobile)
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location.pathname, isMobile]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isMobile, isOpen, open, close, toggle };
}
