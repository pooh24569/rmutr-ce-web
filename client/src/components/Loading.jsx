

export default function Loading({ fullScreen = false, message = "Loading..." }) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-[#e62b2b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#e62b2b] border-t-transparent rounded-full animate-spin" />
        </div>
    );
}