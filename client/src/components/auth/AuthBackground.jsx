export default function AuthBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
      <div className="absolute -top-10 -left-12 h-44 w-44 sm:h-56 sm:w-56 md:h-72 md:w-72 rounded-full blur-2xl opacity-100 bg-gradient-to-br from-rose-300 via-orange-200 to-amber-200" />
      <div className="absolute -top-14 right-[-2.5rem] h-40 w-40 sm:h-52 sm:w-52 md:h-64 md:w-64 rounded-full blur-2xl opacity-40 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-200" />
      <div className="absolute bottom-[-2rem] right-[-3rem] h-64 w-64 sm:h-72 sm:w-72 md:h-96 md:w-96 rounded-full blur-[100px] opacity-50 bg-gradient-to-br from-teal-200 via-emerald-200 to-teal-300" />
      <div className="absolute -bottom-12 -left-14 h-64 w-64 sm:h-72 sm:w-72 md:h-96 md:w-96 rounded-full blur-2xl opacity-50 bg-gradient-to-br from-pink-200 via-rose-200 to-pink-300" />
    </div>
  );
}