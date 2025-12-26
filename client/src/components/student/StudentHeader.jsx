// frontend/src/components/student/StudentHeader.jsx
import { Link } from "react-router-dom";

export default function StudentHeader({ title, subtitle, breadcrumbs }) {
  // ถ้ามี breadcrumbs ให้แสดงแบบ link ได้
  if (breadcrumbs && breadcrumbs.length > 0) {
    return (
      <header className="h-16 flex items-center px-8 border-b border-[#dddddd] bg-white">
        <div>
          <h1 className="text-xs font-semibold tracking-wide uppercase flex items-center gap-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {crumb.link ? (
                  <Link
                    to={crumb.link}
                    className="text-[#e62b2b] hover:underline cursor-pointer"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#e62b2b]">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="text-[#e62b2b]">{">"}</span>
                )}
              </span>
            ))}
          </h1>
          {subtitle && (
            <div className="mt-1 text-[11px] text-[#777]">
              {subtitle}
            </div>
          )}
        </div>
      </header>
    );
  }

  // แบบเดิม (ไม่มี breadcrumbs)
  return (
    <header className="h-16 flex items-center px-8 border-b border-[#dddddd] bg-white">
      <div>
        <h1 className="text-xs font-semibold tracking-wide text-[#e62b2b] uppercase">
          {title}
        </h1>
        {subtitle && (
          <div className="mt-1 text-[11px] text-[#777]">
            {subtitle}
          </div>
        )}
      </div>
    </header>
  );
}