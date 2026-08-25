
import React, { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import { classService } from "@/services/classService";

const ImportStudentsModal = ({ isOpen, onClose, classId, onSuccess }) => {
    const [mode, setMode] = useState("paste");
    const [inputText, setInputText] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onload = (event) => {
                setInputText(event.target.result);
            };
            reader.readAsText(selectedFile);
        }
    };

    const parseStudentIds = (text) => {

        return text
            .split(/[,;\n\t\s]+/)
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
    };

    const handleImport = async () => {
        const studentIds = parseStudentIds(inputText);

        if (studentIds.length === 0) {
            alert("กรุณาระบุรายชื่อนักศึกษา");
            return;
        }

        try {
            setLoading(true);
            setResult(null);

            const response = await classService.importStudents(classId, studentIds);

            if (response.success) {
                setResult(response.data);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Import error:", error);
            alert(error.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setInputText("");
        setFile(null);
        setResult(null);
        onClose();
    };

    const downloadSampleCSV = () => {
        const sample = "username\nstudent001\nstudent002\nstudent003";
        const blob = new Blob([sample], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample_students.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Import นักศึกษา
                    </h3>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {}
                <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                    {!result ? (
                        <>
                            {}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setMode("paste")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "paste"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    📋 วางรายชื่อ
                                </button>
                                <button
                                    onClick={() => setMode("file")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "file"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    📁 อัพโหลด CSV
                                </button>
                            </div>

                            {mode === "paste" ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ระบุ Username หรือ Email ของนักศึกษา
                                    </label>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Student001&#10;Student002&#10;student003@email.com&#10;&#10;หรือคั่นด้วย , เช่น Student001, Student002"
                                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono text-sm"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        แต่ละบรรทัด หรือคั่นด้วย , (comma) หรือ ; (semicolon)
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.txt"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600 font-medium">
                                            {file ? file.name : "คลิกเพื่อเลือกไฟล์ CSV"}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            รองรับ .csv, .txt
                                        </p>
                                    </div>

                                    <button
                                        onClick={downloadSampleCSV}
                                        className="flex items-center gap-2 mt-4 text-sm text-blue-600 hover:underline"
                                    >
                                        <Download className="w-4 h-4" />
                                        ดาวน์โหลดตัวอย่างไฟล์ CSV
                                    </button>

                                    {inputText && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ตัวอย่างข้อมูล ({parseStudentIds(inputText).length} รายการ)
                                            </label>
                                            <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-32">
                                                {inputText.slice(0, 500)}
                                                {inputText.length > 500 && "..."}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {}
                            {inputText && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        พบ <span className="font-bold">{parseStudentIds(inputText).length}</span> รายการที่จะ Import
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (

                        <div className="space-y-4">
                            {}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                    <p className="text-2xl font-bold text-green-600">
                                        {result.summary.added}
                                    </p>
                                    <p className="text-sm text-green-600">เพิ่มสำเร็จ</p>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                                    <p className="text-2xl font-bold text-orange-600">
                                        {result.summary.alreadyExists}
                                    </p>
                                    <p className="text-sm text-orange-600">มีอยู่แล้ว</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                    <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                                    <p className="text-2xl font-bold text-red-600">
                                        {result.summary.notFound}
                                    </p>
                                    <p className="text-sm text-red-600">ไม่พบในระบบ</p>
                                </div>
                            </div>

                            {}
                            {result.added.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-green-700 mb-2">
                                        ✅ เพิ่มสำเร็จ ({result.added.length})
                                    </h4>
                                    <div className="bg-green-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                        {result.added.map((s, i) => (
                                            <div key={i} className="text-sm text-green-800">
                                                {s.username} - {s.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.alreadyExists.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-orange-700 mb-2">
                                        ⚠️ มีอยู่แล้ว ({result.alreadyExists.length})
                                    </h4>
                                    <div className="bg-orange-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                        {result.alreadyExists.map((s, i) => (
                                            <div key={i} className="text-sm text-orange-800">
                                                {s.username} - {s.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.notFound.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-red-700 mb-2">
                                        ❌ ไม่พบในระบบ ({result.notFound.length})
                                    </h4>
                                    <div className="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                        {result.notFound.map((id, i) => (
                                            <div key={i} className="text-sm text-red-800">
                                                {id}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-red-600 mt-2">
                                        * นักศึกษาเหล่านี้ยังไม่ได้ลงทะเบียนในระบบ
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {!result ? (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={loading || !inputText.trim()}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        กำลัง Import...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Import นักศึกษา
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            เสร็จสิ้น
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStudentsModal;
