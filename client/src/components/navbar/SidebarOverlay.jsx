import React from "react";

/**
 * SidebarOverlay — Backdrop สำหรับ mobile sidebar
 * คลิกที่ overlay เพื่อปิด sidebar
 */
const SidebarOverlay = ({ isOpen, onClose }) => {
  return (
    <div
      className={`sidebar-backdrop ${isOpen ? "sidebar-backdrop-visible" : "sidebar-backdrop-hidden"}`}
      onClick={onClose}
      aria-hidden="true"
    />
  );
};

export default SidebarOverlay;
