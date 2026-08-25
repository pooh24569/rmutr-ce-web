
import AuthBackground from "./AuthBackground";

export default function AuthCard({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="relative">
                <AuthBackground />

                <div className="relative z-10 w-[92vw] max-w-sm sm:max-w-md rounded-3xl bg-white/30 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] ring-1 ring-white/60 p-6 sm:p-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/LOGO-RMUTR.png"
                            alt="RMUTR Logo"
                            className="h-14 sm:h-30 w-auto object-contain"
                        />
                    </div>

                    {title && (
                        <p className="text-center text-sm text-neutral-600 mb-6">
                            <span className="font-bold">{title}</span>
                            {subtitle && (
                                <span className="block text-xs mt-1 text-neutral-500">
                                    {subtitle}
                                </span>
                            )}
                        </p>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}