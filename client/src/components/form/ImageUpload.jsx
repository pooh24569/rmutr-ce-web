import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

/**
 * Image Upload Component
 * Allows users to upload and preview images
 */
export const ImageUpload = ({ currentImage, onImageSelect, maxSize = 5 }) => {
    const [preview, setPreview] = useState(currentImage || null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate file size (in MB)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            setError(`Image size must be less than ${maxSize}MB`);
            return;
        }

        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            onImageSelect(file);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onImageSelect(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <div className="relative">
                    {preview ? (
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="profile-image-upload"
                />
                <label
                    htmlFor="profile-image-upload"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition"
                >
                    {preview ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                    Max size: {maxSize}MB. Supported: JPG, PNG, GIF
                </p>
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
            )}
        </div>
    );
};

export default ImageUpload;
