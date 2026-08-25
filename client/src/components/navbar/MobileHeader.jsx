import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

/**
 * MobileHeader — แถบด้านบนบนมือถือ
 * แสดง hamburger menu + title + icon
 * ใช้ร่วมกับทุก Layout ที่มี sidebar
 */
const MobileHeader = ({
  onMenuClick,
  title = "RMUTR",
  subtitle,
  accentColor = "text-amber-600",
  gradientFrom = "from-amber-400",
  gradientTo = "to-amber-600",
  icon: Icon,
  iconElement,
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="เปิดเมนู"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        {iconElement ? (
          iconElement
        ) : Icon ? (
          <div className={`w-8 h-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className={`w-8 h-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">R</span>
          </div>
        )}
        <div className="min-w-0">
          <p className={`font-bold text-sm ${accentColor} truncate`}>{title}</p>
          {subtitle && <p className="text-[10px] text-gray-400 truncate">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
