
import React, { useState, useEffect, useMemo } from "react";
import {
    CheckCircle,
    BookOpen,
    Clock,
    MapPin,
    User,
    ArrowRight,
    Sparkles,
    GraduationCap,
    CalendarDays,
} from "lucide-react";

// ─── Confetti particle component (pure CSS animation) ────────────────
const ConfettiPiece = ({ index }) => {
    const style = useMemo(() => {
        const colors = [
            "#10b981", "#34d399", "#6ee7b7", "#a7f3d0",
            "#f59e0b", "#fbbf24", "#fcd34d",
            "#3b82f6", "#60a5fa", "#93c5fd",
            "#ec4899", "#f472b6",
            "#8b5cf6", "#a78bfa",
        ];
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 2.5 + Math.random() * 2;
        const size = 6 + Math.random() * 8;
        const color = colors[index % colors.length];
        const rotation = Math.random() * 360;
        const drift = -30 + Math.random() * 60;

        return {
            position: "absolute",
            left: `${left}%`,
            top: "-10px",
            width: `${size}px`,
            height: `${size * (0.4 + Math.random() * 0.6)}px`,
            backgroundColor: color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            opacity: 0.9,
            animation: `confettiFall ${duration}s ease-in ${delay}s forwards`,
            transform: `rotate(${rotation}deg)`,
            "--drift": `${drift}px`,
        };
    }, [index]);

    return <div style={style} />;
};

// ─── Day label mapper ────────────────────────────────────────────────
const DAY_LABELS = {
    mon: "จันทร์", tue: "อังคาร", wed: "พุธ",
    thu: "พฤหัส", fri: "ศุกร์", sat: "เสาร์", sun: "อาทิตย์",
    monday: "จันทร์", tuesday: "อังคาร", wednesday: "พุธ",
    thursday: "พฤหัส", friday: "ศุกร์", saturday: "เสาร์", sunday: "อาทิตย์",
};
const getDayLabel = (day) => DAY_LABELS[day] || day;

// ─── Color palette for class cards ───────────────────────────────────
const CARD_COLORS = [
    { bg: "from-blue-500 to-blue-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    { bg: "from-emerald-500 to-emerald-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    { bg: "from-purple-500 to-purple-600", light: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    { bg: "from-orange-500 to-orange-600", light: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    { bg: "from-pink-500 to-pink-600", light: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
    { bg: "from-teal-500 to-teal-600", light: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
];

// ─── Main Component ──────────────────────────────────────────────────
export default function RegistrationSuccess({ classes, totalCredits, onDismiss }) {
    const [countdown, setCountdown] = useState(15);
    const [showCards, setShowCards] = useState(false);

    // Countdown → auto-dismiss
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onDismiss?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onDismiss]);

    // Stagger card animations
    useEffect(() => {
        const t = setTimeout(() => setShowCards(true), 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="flex flex-col h-full relative overflow-hidden">
            {/* ── Inline keyframe styles ─────────────────────────────── */}
            <style>{`
                @keyframes confettiFall {
                    0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
                }
                @keyframes scaleIn {
                    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
                    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes fadeSlideUp {
                    0%   { transform: translateY(30px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse-ring {
                    0%   { transform: scale(0.9); opacity: 0.5; }
                    50%  { transform: scale(1.15); opacity: 0; }
                    100% { transform: scale(0.9); opacity: 0; }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes cardSlideIn {
                    0%   { transform: translateY(40px) scale(0.95); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-8px); }
                }
                .animate-scale-in  { animation: scaleIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
                .animate-fade-up   { animation: fadeSlideUp 0.6s ease-out forwards; }
                .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
                .animate-shimmer   { 
                    background: linear-gradient(90deg, transparent 33%, rgba(255,255,255,0.3) 50%, transparent 66%);
                    background-size: 200% 100%;
                    animation: shimmer 2.5s infinite;
                }
                .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>

            {/* ── Confetti layer ─────────────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => (
                    <ConfettiPiece key={i} index={i} />
                ))}
            </div>

            {/* ── Background gradient ────────────────────────────────── */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50 z-0" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0" />

            {/* ── Scrollable content ─────────────────────────────────── */}
            <div className="relative z-[5] flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-10">

                    {/* ── Hero section ───────────────────────────────── */}
                    <div className="text-center mb-10">
                        {/* Animated check icon */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            <div className="absolute w-28 h-28 rounded-full bg-emerald-400/20 animate-pulse-ring" />
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-scale-in">
                                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Title */}
                        <h1
                            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 animate-fade-up"
                            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
                        >
                            ลงทะเบียนสำเร็จ
                        </h1>
                        <p
                            className="text-gray-500 text-lg animate-fade-up"
                            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
                        >
                            คุณลงทะเบียนเรียนเรียบร้อยแล้ว
                        </p>
                    </div>

                    {/* ── Summary stats ──────────────────────────────── */}
                    <div
                        className="grid grid-cols-3 gap-4 mb-8 animate-fade-up"
                        style={{ animationDelay: "0.65s", animationFillMode: "both" }}
                    >
                        <div className="bg-white/80 backdrop-blur rounded-2xl border border-emerald-100 p-4 text-center shadow-sm">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="text-2xl font-extrabold text-gray-900">{classes.length}</p>
                            <p className="text-xs text-gray-500 font-medium">รายวิชา</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur rounded-2xl border border-blue-100 p-4 text-center shadow-sm">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-100 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-extrabold text-gray-900">{totalCredits}</p>
                            <p className="text-xs text-gray-500 font-medium">หน่วยกิต</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur rounded-2xl border border-purple-100 p-4 text-center shadow-sm">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-100 flex items-center justify-center">
                                <CalendarDays className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-2xl font-extrabold text-gray-900">
                                {new Set(
                                    classes.flatMap(
                                        (cls) => cls.schedule?.map((s) => s.day) || []
                                    )
                                ).size}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">วันเรียน</p>
                        </div>
                    </div>

                    {/* ── Registered class cards ────────────────────── */}
                    <div
                        className="mb-8 animate-fade-up"
                        style={{ animationDelay: "0.8s", animationFillMode: "both" }}
                    >
                        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            รายวิชาที่ลงทะเบียน
                        </h2>

                        <div className="space-y-3">
                            {classes.map((cls, index) => {
                                const color = CARD_COLORS[index % CARD_COLORS.length];
                                return (
                                    <div
                                        key={cls._id}
                                        className={`bg-white rounded-2xl border ${color.border} overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}
                                        style={
                                            showCards
                                                ? {
                                                      animation: `cardSlideIn 0.5s ease-out ${index * 0.1}s both`,
                                                  }
                                                : { opacity: 0 }
                                        }
                                    >
                                        <div className="flex items-stretch">
                                            {/* Color accent bar */}
                                            <div className={`w-1.5 bg-gradient-to-b ${color.bg} flex-shrink-0`} />

                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${color.light} ${color.text}`}>
                                                                {cls.course?.courseCode || cls.classCode}
                                                            </span>
                                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                                {cls.course?.credits || 0} หน่วยกิต
                                                            </span>
                                                        </div>
                                                        <h3 className="font-semibold text-gray-900 text-sm">
                                                            {cls.course?.courseNameTH || cls.className}
                                                        </h3>
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Details row */}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                                    {(cls.instructor || cls.teacher) && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3 text-gray-400" />
                                                            อ.{cls.instructor?.firstName || cls.teacher?.firstName}{" "}
                                                            {cls.instructor?.lastName || cls.teacher?.lastName}
                                                        </span>
                                                    )}
                                                    {cls.schedule?.map((sch, i) => (
                                                        <span key={i} className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            {getDayLabel(sch.day)} {sch.startTime}-{sch.endTime}
                                                        </span>
                                                    ))}
                                                    {cls.schedule?.[0]?.room && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-gray-400" />
                                                            ห้อง {cls.schedule[0].room}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Action Button ──────────────────────────────── */}
                    <div
                        className="text-center pb-8 animate-fade-up"
                        style={{ animationDelay: "1.2s", animationFillMode: "both" }}
                    >
                        <button
                            onClick={() => onDismiss?.()}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-base font-bold rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
                        >
                            ดูรายวิชาทั้งหมด
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <p className="mt-4 text-sm text-gray-400">
                            จะไปหน้ารายวิชาอัตโนมัติใน{" "}
                            <span className="font-bold text-emerald-600 tabular-nums">{countdown}</span>{" "}
                            วินาที
                        </p>

                        {/* Countdown progress */}
                        <div className="w-48 h-1.5 mx-auto mt-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${(countdown / 15) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
