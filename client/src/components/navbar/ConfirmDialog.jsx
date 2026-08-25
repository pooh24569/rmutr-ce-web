
import React from "react";

export default function ConfirmDialog({ show, onConfirm, onCancel }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[90vw] max-w-sm rounded-2xl bg-white shadow-2xl border border-neutral-200 p-6 space-y-5 animate-in fade-in-0 zoom-in-95">
                {}
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <svg
                        className="w-6 h-6 text-red-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
                        <path d="M12 8v6" />
                        <path d="M12 16.5v.5" />
                    </svg>
                </div>

                {}
                <div className="text-center space-y-1">
                    <h2 className="text-lg font-semibold text-neutral-900">
                        Sign out?
                    </h2>
                    <p className="text-sm text-neutral-500">
                        Are you sure you want to sign out of your account?
                    </p>
                </div>

                {}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 text-sm text-white hover:bg-red-700 shadow-sm transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}