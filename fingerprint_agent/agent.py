"""
===================================================================
🌐 agent.py — Fingerprint Local WebSocket Agent
===================================================================

WebSocket Server ที่รันบนเครื่องอาจารย์ (Windows)
เชื่อมระหว่าง U.are.U 4500 Scanner กับ React App

สถาปัตยกรรม:
[U.are.U 4500] → [scanner_winbio.py] → [agent.py ws://localhost:8765] → [React]

Commands ที่รับจาก React (JSON):
┌──────────────────────────────────────────────────────────┐
│ { "action": "status" }          → ตรวจสอบสถานะ scanner  │
│ { "action": "capture" }         → scan 1 ครั้ง          │
│ { "action": "start_continuous" } → เริ่มสแกนต่อเนื่อง   │
│ { "action": "stop_continuous" }  → หยุดสแกนต่อเนื่อง    │
└──────────────────────────────────────────────────────────┘

Response ที่ส่งกลับ React (JSON):
┌──────────────────────────────────────────────────────────┐
│ { "type": "status", "connected": true, "device": "..." }│
│ { "type": "captured", "image": "base64...", "size": 123 }│
│ { "type": "error", "message": "..." }                    │
│ { "type": "info", "message": "..." }                     │
└──────────────────────────────────────────────────────────┘

การใช้งาน:
1. เปิด Command Prompt ด้วยสิทธิ์ Administrator
2. cd fingerprint_agent
3. pip install -r requirements.txt
4. python agent.py

===================================================================
"""

import asyncio
import json
import base64
import logging
import signal
import sys
from datetime import datetime

import websockets

from config import WS_HOST, WS_PORT, CONTINUOUS_INTERVAL, LOG_LEVEL
from scanner_winbio import FingerprintScanner

# ===================================================================
# Logging Setup
# ===================================================================

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("agent")


# ===================================================================
# Global State
# ===================================================================

scanner = None                    # FingerprintScanner instance
continuous_mode = False           # กำลัง scan ต่อเนื่องหรือไม่
connected_clients = set()         # เก็บ client ทั้งหมดที่เชื่อมต่อ


# ===================================================================
# Helper Functions
# ===================================================================

def create_response(msg_type, **kwargs):
    """สร้าง JSON response มาตรฐาน"""
    return json.dumps({
        "type": msg_type,
        "timestamp": datetime.now().isoformat(),
        **kwargs,
    })


def data_to_base64(raw_data):
    """แปลง raw bytes เป็น base64 string สำหรับส่งผ่าน WebSocket"""
    return base64.b64encode(raw_data).decode("utf-8")


# ===================================================================
# Command Handlers
# ===================================================================

async def handle_status(websocket):
    """ตรวจสอบสถานะ scanner แล้วส่งผลกลับ"""
    global scanner

    try:
        if scanner is None:
            scanner = FingerprintScanner()

        device_count = scanner.check_devices()

        response = create_response(
            "status",
            connected=scanner.is_connected,
            deviceCount=device_count,
            deviceName="DigitalPersona U.are.U 4500",
            agentVersion="1.0.0",
            mode="continuous" if continuous_mode else "single",
        )
        await websocket.send(response)

    except Exception as e:
        logger.error(f"Status check error: {e}")
        await websocket.send(create_response("error", message=str(e)))


async def handle_capture(websocket):
    """
    Capture ลายนิ้วมือ 1 ครั้ง

    ขั้นตอน:
    1. เปิด session (ถ้ายังไม่เปิด)
    2. รอจนกว่านิ้วจะวาง (blocking ใน thread แยก)
    3. ส่งผลลัพธ์กลับเป็น base64
    """
    global scanner

    try:
        if scanner is None:
            scanner = FingerprintScanner()

        if not scanner.is_connected:
            scanner.open()

        # แจ้ง client ว่ากำลังรอนิ้ว
        await websocket.send(create_response("info", message="กรุณาวางนิ้วบน Scanner..."))

        # Run capture ใน thread แยก (เพราะ WinBioCaptureSample เป็น blocking call)
        loop = asyncio.get_event_loop()
        raw_data = await loop.run_in_executor(None, scanner.capture)

        # ส่งผลลัพธ์กลับ
        image_base64 = data_to_base64(raw_data)

        response = create_response(
            "captured",
            image=image_base64,
            size=len(raw_data),
            format="raw",
        )
        await websocket.send(response)
        logger.info(f"📤 ส่ง fingerprint data: {len(raw_data)} bytes")

    except RuntimeError as e:
        logger.warning(f"Capture warning: {e}")
        await websocket.send(create_response("error", message=str(e), code="CAPTURE_FAILED"))
    except Exception as e:
        logger.error(f"Capture error: {e}")
        await websocket.send(create_response("error", message=str(e), code="UNKNOWN_ERROR"))


async def handle_continuous_start(websocket):
    """
    เริ่มโหมดสแกนต่อเนื่อง (Continuous Mode)

    นักศึกษาสามารถวางนิ้วต่อเนื่องได้เรื่อยๆ
    ทุกครั้งที่สแกนสำเร็จจะส่งผลกลับทันที

    ใช้สำหรับ: เช็คชื่อต่อเนื่อง (นักศึกษาเดินมาวางนิ้วทีละคน)
    """
    global continuous_mode, scanner

    if continuous_mode:
        await websocket.send(create_response("info", message="กำลัง scan ต่อเนื่องอยู่แล้ว"))
        return

    continuous_mode = True
    await websocket.send(create_response("info", message="🔄 เริ่มโหมดสแกนต่อเนื่อง"))
    logger.info("🔄 เริ่ม Continuous Mode")

    try:
        if scanner is None:
            scanner = FingerprintScanner()

        if not scanner.is_connected:
            scanner.open()

        while continuous_mode:
            try:
                # แจ้งว่ากำลังรอ
                await websocket.send(create_response(
                    "info",
                    message="👆 กรุณาวางนิ้ว... (กด Stop เพื่อหยุด)"
                ))

                # Capture ใน thread แยก
                loop = asyncio.get_event_loop()
                raw_data = await loop.run_in_executor(None, scanner.capture)

                # ส่งผลลัพธ์
                image_base64 = data_to_base64(raw_data)
                response = create_response(
                    "captured",
                    image=image_base64,
                    size=len(raw_data),
                    format="raw",
                    mode="continuous",
                )
                await websocket.send(response)
                logger.info(f"📤 [Continuous] ส่ง data: {len(raw_data)} bytes")

                # Delay ก่อน capture ถัดไป
                await asyncio.sleep(CONTINUOUS_INTERVAL)

            except RuntimeError as e:
                # Bad capture — ข้ามไป capture ใหม่
                logger.warning(f"⚠️  Continuous capture warning: {e}")
                await websocket.send(create_response(
                    "warning",
                    message=str(e),
                ))
                await asyncio.sleep(CONTINUOUS_INTERVAL)

    except websockets.exceptions.ConnectionClosed:
        logger.info("📴 Client ตัดการเชื่อมต่อ — หยุด continuous mode")
    except Exception as e:
        logger.error(f"Continuous error: {e}")
        await websocket.send(create_response("error", message=str(e)))
    finally:
        continuous_mode = False
        logger.info("⏹️  หยุด Continuous Mode")


async def handle_continuous_stop(websocket):
    """หยุดโหมดสแกนต่อเนื่อง"""
    global continuous_mode

    continuous_mode = False
    await websocket.send(create_response("info", message="⏹️  หยุดสแกนต่อเนื่องแล้ว"))
    logger.info("⏹️  หยุด Continuous Mode (จาก client)")


# ===================================================================
# WebSocket Handler — จุดรับ message หลัก
# ===================================================================

async def websocket_handler(websocket):
    """
    จัดการ WebSocket connection จาก React App

    รับ JSON command → เรียก handler ที่เหมาะสม → ส่ง response กลับ
    """
    global connected_clients

    client_ip = websocket.remote_address[0] if websocket.remote_address else "unknown"
    connected_clients.add(websocket)
    logger.info(f"🔗 Client เชื่อมต่อ: {client_ip} (รวม: {len(connected_clients)} clients)")

    # ส่ง welcome message
    await websocket.send(create_response(
        "info",
        message="🔷 Fingerprint Agent พร้อมใช้งาน",
        agentVersion="1.0.0",
    ))

    try:
        async for message in websocket:
            try:
                cmd = json.loads(message)
                action = cmd.get("action", "")

                logger.debug(f"📨 รับ command: {action}")

                # --- Route ไปยัง handler ที่เหมาะสม ---
                if action == "status":
                    await handle_status(websocket)

                elif action == "capture":
                    await handle_capture(websocket)

                elif action == "start_continuous":
                    await handle_continuous_start(websocket)

                elif action == "stop_continuous":
                    await handle_continuous_stop(websocket)

                else:
                    await websocket.send(create_response(
                        "error",
                        message=f"ไม่รู้จัก action: '{action}'",
                        availableActions=["status", "capture", "start_continuous", "stop_continuous"],
                    ))

            except json.JSONDecodeError:
                await websocket.send(create_response(
                    "error",
                    message="รูปแบบ JSON ไม่ถูกต้อง",
                ))

    except websockets.exceptions.ConnectionClosedOK:
        logger.info(f"📴 Client ตัดการเชื่อมต่อ (ปกติ): {client_ip}")
    except websockets.exceptions.ConnectionClosedError as e:
        logger.warning(f"📴 Client ตัดการเชื่อมต่อ (error): {client_ip} — {e}")
    finally:
        connected_clients.discard(websocket)
        logger.info(f"📊 เหลือ {len(connected_clients)} clients")


# ===================================================================
# Main — Server Startup
# ===================================================================

async def main():
    """เริ่ม WebSocket Server"""
    global scanner

    print()
    print("=" * 60)
    print("🔷 Fingerprint Agent — DigitalPersona U.are.U 4500")
    print("=" * 60)
    print(f"📡 WebSocket: ws://{WS_HOST}:{WS_PORT}")
    print(f"🐍 Python:    {sys.version.split()[0]}")
    print(f"💻 Platform:  {sys.platform}")
    print("=" * 60)
    print()

    # ตรวจสอบ scanner
    try:
        scanner = FingerprintScanner()
        device_count = scanner.check_devices()
        if device_count == 0:
            print("⚠️  ไม่พบ fingerprint scanner — กรุณาเสียบ U.are.U 4500")
            print("   (Agent จะยังทำงาน แต่ capture จะไม่สำเร็จ)")
        else:
            print(f"✅ พบ scanner {device_count} เครื่อง")
    except Exception as e:
        print(f"⚠️  ตรวจสอบ scanner ไม่สำเร็จ: {e}")

    print()
    print("🚀 กำลังเริ่ม WebSocket Server...")
    print(f"   เปิด React App แล้วเชื่อมต่อที่ ws://localhost:{WS_PORT}")
    print()
    print("📌 กด Ctrl+C เพื่อหยุด")
    print("-" * 60)

    # กำหนด allowed origins เพื่อความปลอดภัย
    # อนุญาตเฉพาะ localhost (React dev server)
    allowed_origins = [
        "http://localhost:5173",    # Vite default
        "http://localhost:5174",
        "http://localhost:3000",    # CRA default
        "http://127.0.0.1:5173",
    ]

    # เริ่ม WebSocket Server
    async with websockets.serve(
        websocket_handler,
        WS_HOST,
        WS_PORT,
        # Security: จำกัด origin ที่เชื่อมต่อได้
        origins=allowed_origins,
        # Ping/Pong สำหรับ keep-alive
        ping_interval=30,
        ping_timeout=10,
        # Max message size (5MB — รองรับ fingerprint image)
        max_size=5 * 1024 * 1024,
    ) as server:
        logger.info(f"✅ WebSocket Server พร้อม: ws://{WS_HOST}:{WS_PORT}")

        # รอจนกว่าจะ Ctrl+C
        stop = asyncio.Future()

        def signal_handler():
            logger.info("🛑 กำลังปิด Agent...")
            stop.set_result(True)

        loop = asyncio.get_event_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                loop.add_signal_handler(sig, signal_handler)
            except NotImplementedError:
                # Windows ไม่รองรับ add_signal_handler สำหรับบาง signal
                pass

        try:
            await stop
        except asyncio.CancelledError:
            pass

    # Cleanup
    if scanner and scanner.is_connected:
        scanner.close()

    print("\n✅ Agent ปิดเรียบร้อย")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n✅ Agent ปิดเรียบร้อย (Ctrl+C)")
    except Exception as e:
        print(f"\n❌ เกิดข้อผิดพลาด: {e}")
        logger.exception("Fatal error")
        sys.exit(1)
