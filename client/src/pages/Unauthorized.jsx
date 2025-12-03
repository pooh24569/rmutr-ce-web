// frontend/src/pages/Unauthorized.jsx
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <ShieldAlert className="w-10 h-10 text-orange-600" />
                </div>

                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Access Denied
                </h1>

                <p className="text-neutral-600 mb-6">
                    You don't have permission to access this page.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        Go to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        Go Back
                    </button>
                </div>

                <p className="text-sm text-neutral-500 mt-6">
                    If you believe this is an error, please contact support.
                </p>
            </div>
        </div>
    );
}