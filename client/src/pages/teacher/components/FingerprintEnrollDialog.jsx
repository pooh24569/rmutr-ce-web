/**
 * ===================================================================
 * 🔐 FingerprintEnrollDialog — Dialog ลงทะเบียนลายนิ้วมือ
 * ===================================================================
 *
 * แสดง:
 * - PDPA Consent Checkbox (บังคับก่อนลงทะเบียน)
 * - เลือกนิ้วที่จะลงทะเบียน
 * - สแกน + preview ภาพลายนิ้วมือ
 * - ส่งลงทะเบียนไปยัง API
 *
 * Props:
 *   isOpen    — เปิด/ปิด dialog
 *   onClose   — callback เมื่อปิด
 *   student   — { _id, firstName, lastName, username }
 *   onSuccess — callback เมื่อลงทะเบียนสำเร็จ
 *
 * ===================================================================
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import useFingerprintScanner from "@/hooks/useFingerprintScanner";
import fingerprintService from "@/services/fingerprintService";

const FINGER_OPTIONS = [
  { value: "RIGHT_INDEX", label: "นิ้วชี้ขวา", emoji: "👉" },
  { value: "RIGHT_THUMB", label: "นิ้วโป้งขวา", emoji: "👍" },
  { value: "LEFT_INDEX", label: "นิ้วชี้ซ้าย", emoji: "👈" },
  { value: "LEFT_THUMB", label: "นิ้วโป้งซ้าย", emoji: "👍" },
];

const FingerprintEnrollDialog = ({ isOpen, onClose, student, onSuccess }) => {
  // --- Scanner Hook ---
  const {
    status,
    lastMessage,
    connect,
    disconnect,
    setOnCapture,
  } = useFingerprintScanner();

  // --- State ---
  const [step, setStep] = useState(1); // 1=consent, 2=scan, 3=done
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [fingerIndex, setFingerIndex] = useState("RIGHT_INDEX");
  const [capturedImage, setCapturedImage] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // --- Reset เมื่อเปิด dialog ---
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPdpaConsent(false);
      setCapturedImage(null);
      setEnrolling(false);
      setEnrollResult(null);
      setError("");
    } else {
      disconnect();
    }
  }, [isOpen, disconnect]);

  // --- รับ fingerprint จาก scanner ---
  const handleCapture = useCallback((captureData) => {
    setCapturedImage(captureData.image);
  }, []);

  useEffect(() => {
    setOnCapture(handleCapture);
  }, [setOnCapture, handleCapture]);

  // --- ส่งลงทะเบียน ---
  const handleEnroll = async () => {
    if (!capturedImage || !student?._id) return;

    setEnrolling(true);
    setError("");

    try {
      const response = await fingerprintService.enroll({
        studentId: student._id,
        imageBase64: capturedImage,
        fingerIndex,
        pdpaConsent: true,
      });

      if (response.success) {
        setEnrollResult(response);
        setStep(3);
        if (onSuccess) onSuccess(student._id);
      }
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setEnrolling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex items-center gap-3 text-white">
            <Fingerprint className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">ลงทะเบียนลายนิ้วมือ</h2>
              <p className="text-sm text-blue-100">
                {student?.firstName} {student?.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-100">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${step >= s
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s ? "bg-blue-500" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* === Step 1: PDPA Consent === */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">
                    แจ้งเตือนตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                  </p>
                  <p>
                    ลายนิ้วมือเป็น <strong>ข้อมูลชีวภาพ (Biometric Data)</strong>{" "}
                    ซึ่งจัดเป็นข้อมูลอ่อนไหว ตามมาตรา 26
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>วัตถุประสงค์:</strong> ใช้สำหรับยืนยันตัวตนในการเช็คชื่อเข้าเรียนเท่านั้น
                </p>
                <p>
                  <strong>การจัดเก็บ:</strong> ข้อมูลจะถูกเข้ารหัส AES-256 ก่อนจัดเก็บ
                </p>
                <p>
                  <strong>สิทธิ์:</strong> นักศึกษามีสิทธิ์ขอลบข้อมูลได้ตลอดเวลา
                </p>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={pdpaConsent}
                  onChange={(e) => setPdpaConsent(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  นักศึกษา <strong>{student?.firstName} {student?.lastName}</strong>{" "}
                  ยินยอมให้เก็บรวบรวมข้อมูลลายนิ้วมือเพื่อใช้ในการเช็คชื่อเข้าเรียน
                </span>
              </label>

              {/* Finger Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกนิ้วที่จะลงทะเบียน
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FINGER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFingerIndex(option.value)}
                      className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all
                        ${fingerIndex === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }
                      `}
                    >
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setStep(2); connect(); }}
                disabled={!pdpaConsent}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
              >
                ถัดไป — เชื่อมต่อ Scanner
              </button>
            </div>
          )}

          {/* === Step 2: Scan Fingerprint === */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Scanner Status */}
              <div className="text-center py-6">
                {!capturedImage ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      {status === "connected" ? (
                        <Fingerprint className="w-10 h-10 text-blue-500 animate-pulse" />
                      ) : (
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                      )}
                    </div>
                    <p className="text-gray-600 font-medium">
                      {status === "connected"
                        ? "กรุณาวางนิ้วบน Scanner"
                        : "กำลังเชื่อมต่อ Scanner..."
                      }
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {lastMessage}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <p className="text-emerald-600 font-semibold">
                      สแกนลายนิ้วมือสำเร็จ!
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      กดปุ่มด้านล่างเพื่อลงทะเบียน
                    </p>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(1); disconnect(); setCapturedImage(null); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleEnroll}
                  disabled={!capturedImage || enrolling}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังลงทะเบียน...</span>
                    </>
                  ) : (
                    <span>ลงทะเบียน</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* === Step 3: Success === */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ลงทะเบียนสำเร็จ! 🎉
              </h3>
              <p className="text-gray-500 mb-6">
                {student?.firstName} {student?.lastName} — {FINGER_OPTIONS.find(f => f.value === fingerIndex)?.label}
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
              >
                เสร็จสิ้น
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FingerprintEnrollDialog;
