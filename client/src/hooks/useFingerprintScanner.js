/**
 * ===================================================================
 * 🔷 useFingerprintScanner — Custom Hook จัดการ WebSocket
 * ===================================================================
 *
 * เชื่อมต่อกับ Python Local Agent ผ่าน WebSocket
 * รับข้อมูลลายนิ้วมือแบบ real-time
 *
 * Usage:
 *   const {
 *     status,         // 'disconnected' | 'connecting' | 'connected' | 'error'
 *     lastCapture,    // { image: base64, size, timestamp }
 *     lastMessage,    // ข้อความล่าสุดจาก agent
 *     connect,        // เชื่อมต่อ WebSocket
 *     disconnect,     // ตัดการเชื่อมต่อ
 *     capture,        // สั่ง scan 1 ครั้ง
 *     startContinuous, // เริ่ม scan ต่อเนื่อง
 *     stopContinuous,  // หยุด scan ต่อเนื่อง
 *   } = useFingerprintScanner();
 *
 * ===================================================================
 */

import { useState, useCallback, useRef, useEffect } from "react";

const DEFAULT_WS_URL = "ws://localhost:8765";

export function useFingerprintScanner(wsUrl = DEFAULT_WS_URL) {
  // --- State ---
  const [status, setStatus] = useState("disconnected");
  const [lastCapture, setLastCapture] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const [scannerInfo, setScannerInfo] = useState(null);
  const [isContinuous, setIsContinuous] = useState(false);

  // --- Refs ---
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const onCaptureCallbackRef = useRef(null);

  /**
   * ลงทะเบียน callback เมื่อ สแกนสำเร็จ
   * ใช้สำหรับ auto-submit ไปยัง API
   */
  const setOnCapture = useCallback((callback) => {
    onCaptureCallbackRef.current = callback;
  }, []);

  /**
   * เชื่อมต่อ WebSocket กับ Python Agent
   */
  const connect = useCallback(() => {
    // ป้องกันการเชื่อมต่อซ้ำ
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStatus("connected");
        setLastMessage("เชื่อมต่อ Scanner สำเร็จ");

        // ถาม status ทันที
        ws.send(JSON.stringify({ action: "status" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "captured":
              // ได้ลายนิ้วมือ!
              setLastCapture({
                image: data.image,
                size: data.size,
                format: data.format,
                timestamp: data.timestamp,
                mode: data.mode || "single",
              });
              setLastMessage(
                `สแกนสำเร็จ (${data.size} bytes)`,
              );

              // เรียก callback ถ้ามี
              if (onCaptureCallbackRef.current) {
                onCaptureCallbackRef.current({
                  image: data.image,
                  size: data.size,
                });
              }
              break;

            case "status":
              setScannerInfo({
                connected: data.connected,
                deviceCount: data.deviceCount,
                deviceName: data.deviceName,
                agentVersion: data.agentVersion,
                mode: data.mode,
              });
              break;

            case "info":
              setLastMessage(data.message);
              break;

            case "warning":
              setLastMessage(`⚠️ ${data.message}`);
              break;

            case "error":
              setLastMessage(`❌ ${data.message}`);
              break;

            default:
              break;
          }
        } catch {
          // ไม่ใช่ JSON — ข้ามไป
        }
      };

      ws.onclose = (event) => {
        setStatus("disconnected");
        setIsContinuous(false);
        wsRef.current = null;

        if (!event.wasClean) {
          setLastMessage("การเชื่อมต่อขาด — กรุณาตรวจสอบ Agent");
        }
      };

      ws.onerror = () => {
        setStatus("error");
        setLastMessage(
          "ไม่สามารถเชื่อมต่อ Agent ได้ — กรุณาเปิด python agent.py",
        );
      };

      wsRef.current = ws;
    } catch {
      setStatus("error");
      setLastMessage("WebSocket connection failed");
    }
  }, [wsUrl]);

  /**
   * ตัดการเชื่อมต่อ
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }

    setStatus("disconnected");
    setIsContinuous(false);
    setLastMessage("ตัดการเชื่อมต่อแล้ว");
  }, []);

  /**
   * ส่ง command ไปยัง Agent
   */
  const sendCommand = useCallback((action, extraData = {}) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      setLastMessage("ยังไม่ได้เชื่อมต่อ — กดปุ่มเชื่อมต่อก่อน");
      return false;
    }

    wsRef.current.send(JSON.stringify({ action, ...extraData }));
    return true;
  }, []);

  /**
   * สั่ง scan 1 ครั้ง
   */
  const capture = useCallback(() => {
    setLastMessage("กรุณาวางนิ้วบน Scanner...");
    return sendCommand("capture");
  }, [sendCommand]);

  /**
   * เริ่ม scan ต่อเนื่อง
   */
  const startContinuous = useCallback(() => {
    setIsContinuous(true);
    setLastMessage("เริ่มโหมดสแกนต่อเนื่อง...");
    return sendCommand("start_continuous");
  }, [sendCommand]);

  /**
   * หยุด scan ต่อเนื่อง
   */
  const stopContinuous = useCallback(() => {
    setIsContinuous(false);
    setLastMessage("กำลังหยุดสแกน...");
    return sendCommand("stop_continuous");
  }, [sendCommand]);

  /**
   * ถาม status
   */
  const checkStatus = useCallback(() => {
    return sendCommand("status");
  }, [sendCommand]);

  // --- Cleanup on unmount ---
  useEffect(() => {
    const ws = wsRef.current;
    const timeout = reconnectTimeoutRef.current;
    return () => {
      if (ws) {
        ws.close(1000, "Component unmounted");
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return {
    // State
    status,
    lastCapture,
    lastMessage,
    scannerInfo,
    isContinuous,

    // Actions
    connect,
    disconnect,
    capture,
    startContinuous,
    stopContinuous,
    checkStatus,
    setOnCapture,
  };
}

export default useFingerprintScanner;
