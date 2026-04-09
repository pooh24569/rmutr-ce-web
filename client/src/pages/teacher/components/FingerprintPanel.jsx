/**
 * ===================================================================
 * 🔷 FingerprintPanel — ส่วนแสดงผล Scanner ในหน้าเช็คชื่อ
 * ===================================================================
 *
 * แสดง:
 * - สถานะเชื่อมต่อ Scanner (LED indicator)
 * - ปุ่มเชื่อมต่อ / เริ่มสแกน / หยุดสแกน
 * - ผลลัพธ์ล่าสุด (ชื่อนักศึกษา, สถานะ)
 * - Animation เมื่อสแกนสำเร็จ/ล้มเหลว
 *
 * Props:
 *   sessionId  — ID ของ session ที่กำลังเช็คชื่อ
 *   onCheckInSuccess — callback เมื่อเช็คชื่อสำเร็จ
 *
 * ===================================================================
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Fingerprint,
  Wifi,
  WifiOff,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import useFingerprintScanner from "@/hooks/useFingerprintScanner";
import fingerprintService from "@/services/fingerprintService";

const FingerprintPanel = ({ sessionId, onCheckInSuccess }) => {
  const {
    status,
    lastMessage,
    isContinuous,
    connect,
    disconnect,
    startContinuous,
    stopContinuous,
    setOnCapture,
  } = useFingerprintScanner();

  const [result, setResult] = useState(null); // { success, student, status, message }
  const [processing, setProcessing] = useState(false);
  const [resultAnimation, setResultAnimation] = useState(""); // 'success' | 'error' | ''

  /**
   * เมื่อได้ fingerprint จาก scanner → ส่งไป API เพื่อ identify + check-in
   */
  const handleCapture = useCallback(
    async (captureData) => {
      if (!sessionId || processing) return;

      setProcessing(true);
      setResult(null);
      setResultAnimation("");

      try {
        const response = await fingerprintService.identifyAndCheckIn({
          sessionId,
          imageBase64: captureData.image,
        });

        if (response.success) {
          setResult({
            success: true,
            student: response.data.student,
            checkInStatus: response.data.status,
            message: response.message,
            score: response.data.matchScore,
          });
          setResultAnimation("success");

          // เรียก callback เพื่ออัปเดตรายชื่อ
          if (onCheckInSuccess) {
            onCheckInSuccess();
          }
        }
      } catch (error) {
        setResult({
          success: false,
          message: error.message || "เกิดข้อผิดพลาด",
        });
        setResultAnimation("error");
      } finally {
        setProcessing(false);

        // ลบ animation หลัง 3 วินาที
        setTimeout(() => setResultAnimation(""), 3000);
      }
    },
    [sessionId, processing, onCheckInSuccess],
  );

  // ลงทะเบียน callback สำหรับ auto-submit
  useEffect(() => {
    setOnCapture(handleCapture);
  }, [setOnCapture, handleCapture]);

  // --- Status LED Colors ---
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          color: "bg-emerald-500",
          pulse: true,
          text: "เชื่อมต่อแล้ว",
          textColor: "text-emerald-600",
          icon: Wifi,
        };
      case "connecting":
        return {
          color: "bg-amber-500",
          pulse: true,
          text: "กำลังเชื่อมต่อ...",
          textColor: "text-amber-600",
          icon: Loader2,
        };
      case "error":
        return {
          color: "bg-red-500",
          pulse: false,
          text: "เชื่อมต่อไม่ได้",
          textColor: "text-red-600",
          icon: WifiOff,
        };
      default:
        return {
          color: "bg-gray-400",
          pulse: false,
          text: "ยังไม่เชื่อมต่อ",
          textColor: "text-gray-500",
          icon: WifiOff,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-500
        ${resultAnimation === "success"
          ? "border-emerald-300 shadow-lg shadow-emerald-500/20"
          : resultAnimation === "error"
            ? "border-red-300 shadow-lg shadow-red-500/20"
            : "border-gray-100 shadow-sm"
        }
        bg-white
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${status === "connected"
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                  : "bg-gray-200"
                }
              `}
            >
              <Fingerprint className={`w-5 h-5 ${status === "connected" ? "text-white" : "text-gray-500"}`} />
            </div>

            {/* LED Indicator */}
            <div className="absolute -top-0.5 -right-0.5">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`}>
                {statusConfig.pulse && (
                  <div className={`absolute inset-0 rounded-full ${statusConfig.color} animate-ping opacity-75`} />
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800">
              สแกนลายนิ้วมือ
            </h3>
            <div className={`flex items-center gap-1.5 text-xs ${statusConfig.textColor}`}>
              <StatusIcon className={`w-3 h-3 ${status === "connecting" ? "animate-spin" : ""}`} />
              <span>{statusConfig.text}</span>
            </div>
          </div>
        </div>

        {/* Connect / Disconnect Button */}
        {status === "disconnected" || status === "error" ? (
          <button
            onClick={connect}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            เชื่อมต่อ Scanner
          </button>
        ) : status === "connected" ? (
          <button
            onClick={disconnect}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ตัดการเชื่อมต่อ
          </button>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-6">
        {status !== "connected" ? (
          /* --- Not Connected State --- */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Fingerprint className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-2">
              กรุณาเชื่อมต่อ Scanner เพื่อเริ่มสแกนลายนิ้วมือ
            </p>
            <p className="text-gray-400 text-xs">
              ต้องเปิด <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">python agent.py</code> บนเครื่องอาจารย์
            </p>
          </div>
        ) : (
          /* --- Connected State --- */
          <div className="space-y-4">
            {/* Scan Controls */}
            <div className="flex gap-3">
              {!isContinuous ? (
                <button
                  onClick={startContinuous}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  <span className="font-medium">เริ่มสแกนต่อเนื่อง</span>
                </button>
              ) : (
                <button
                  onClick={stopContinuous}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25"
                >
                  <Square className="w-5 h-5" />
                  <span className="font-medium">หยุดสแกน</span>
                </button>
              )}
            </div>

            {/* Status Message */}
            {lastMessage && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
                {processing ? (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                ) : (
                  <Fingerprint className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-600 truncate">
                  {lastMessage}
                </span>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div
                className={`
                  rounded-xl p-4 transition-all duration-300
                  ${result.success
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                    : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
                  }
                `}
              >
                {result.success ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {result.student?.firstName} {result.student?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.student?.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`
                            inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${result.checkInStatus === "PRESENT"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                            }
                          `}
                        >
                          {result.checkInStatus === "PRESENT" ? "มาเรียน ✅" : "สาย ⚠️"}
                        </span>
                        {result.score && (
                          <span className="text-xs text-gray-400">
                            ความแม่นยำ: {Math.round(result.score)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      {result.message?.includes("เช็คชื่อแล้ว") ? (
                        <AlertTriangle className="w-7 h-7 text-amber-600" />
                      ) : (
                        <XCircle className="w-7 h-7 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {result.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scanning Animation Overlay */}
      {isContinuous && !processing && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse rounded-full" />
        </div>
      )}
    </div>
  );
};

export default FingerprintPanel;
