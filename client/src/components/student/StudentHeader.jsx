// frontend/src/components/student/StudentHeader.jsx

export default function StudentHeader({ title, subtitle }) {
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