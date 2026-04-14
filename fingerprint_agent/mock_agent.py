"""
===================================================================
🧪 mock_agent.py — Mock Fingerprint Agent สำหรับพัฒนาบน Linux
===================================================================

จำลอง WebSocket Server เหมือน agent.py ตัวจริง
แต่ไม่ต้องการ U.are.U 4500 หรือ winbio.dll

ใช้ภาพลายนิ้วมือตัวอย่าง (สร้าง grayscale image จำลอง)
ส่งกลับให้ React เหมือนสแกนจริงทุกประการ

Usage:
    source venv/bin/activate
    pip install websockets Pillow
    python mock_agent.py

===================================================================
"""

import asyncio
import json
import base64
import io
import sys
import random
from datetime import datetime

import websockets

# สร้างภาพจำลองด้วย Pillow (ถ้ามี) หรือ raw bytes
try:
    from PIL import Image, ImageDraw
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False

# --- Config ---
WS_HOST = "localhost"
WS_PORT = 8765
CONTINUOUS_INTERVAL = 2.0  # ช้ากว่าตัวจริง เพื่อให้ดู UI ชัดๆ

# --- Global State ---
continuous_mode = False
connected_clients = set()


# --- Cached mock fingerprint (ใช้ภาพเดิมทุกครั้งเพื่อให้ match ได้) ---
_cached_fingerprint = None


def create_mock_fingerprint():
    """
    สร้างภาพลายนิ้วมือจำลอง (PNG, grayscale)
    ใช้ภาพเดิมทุกครั้ง → SourceAFIS จะ match ได้

    ถ้ามี Pillow → สร้างภาพจำลองที่มีลายวงกลม (คล้ายนิ้วมือ)
    ถ้าไม่มี Pillow → สร้าง raw grayscale bytes
    """
    global _cached_fingerprint
    if _cached_fingerprint is not None:
        return _cached_fingerprint

    # ใช้ seed คงที่ → ให้ผลเหมือนกันทุกครั้ง
    rng = random.Random(42)

    if HAS_PILLOW:
        # สร้างภาพ 300x400 grayscale
        width, height = 300, 400
        img = Image.new("L", (width, height), color=220)
        draw = ImageDraw.Draw(img)

        # วาดวงกลมซ้อนกันจำลองลายนิ้วมือ
        cx, cy = width // 2, height // 2
        for r in range(10, 150, 8):
            offset_x = rng.randint(-3, 3)
            offset_y = rng.randint(-3, 3)
            shade = rng.randint(40, 120)
            draw.ellipse(
                [cx - r + offset_x, cy - r + offset_y,
                 cx + r + offset_x, cy + r + offset_y],
                outline=shade,
                width=2,
            )

        # แปลงเป็น PNG bytes
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        _cached_fingerprint = buf.getvalue()
    else:
        # ถ้าไม่มี Pillow → สร้าง raw bytes 300x400
        width, height = 300, 400
        pixels = bytearray()
        for y in range(height):
            for x in range(width):
                dx = x - width // 2
                dy = y - height // 2
                dist = (dx * dx + dy * dy) ** 0.5
                val = int(128 + 80 * (((dist / 8) % 1) - 0.5))
                val = max(0, min(255, val))
                pixels.append(val)
        _cached_fingerprint = bytes(pixels)

    return _cached_fingerprint


def create_response(msg_type, **kwargs):
    """สร้าง JSON response มาตรฐาน (เหมือน agent.py จริง)"""
    return json.dumps({
        "type": msg_type,
        "timestamp": datetime.now().isoformat(),
        **kwargs,
    })


async def handle_status(websocket):
    response = create_response(
        "status",
        connected=True,
        deviceCount=1,
        deviceName="[MOCK] DigitalPersona U.are.U 4500",
        agentVersion="1.0.0-mock",
        mode="continuous" if continuous_mode else "single",
    )
    await websocket.send(response)


async def handle_capture(websocket):
    """จำลองการสแกน — หน่วงเวลา 1.5 วินาที แล้วส่งภาพจำลอง"""
    await websocket.send(create_response("info", message="🧪 [MOCK] กรุณาวางนิ้วบน Scanner..."))

    # จำลองเวลาสแกน
    await asyncio.sleep(1.5)

    raw_data = create_mock_fingerprint()
    image_base64 = base64.b64encode(raw_data).decode("utf-8")

    response = create_response(
        "captured",
        image=image_base64,
        size=len(raw_data),
        format="png" if HAS_PILLOW else "raw",
    )
    await websocket.send(response)
    print(f"📤 [MOCK] ส่ง fingerprint data: {len(raw_data)} bytes")


async def handle_continuous_start(websocket):
    global continuous_mode

    if continuous_mode:
        await websocket.send(create_response("info", message="กำลัง scan ต่อเนื่องอยู่แล้ว"))
        return

    continuous_mode = True
    await websocket.send(create_response("info", message="🔄 [MOCK] เริ่มโหมดสแกนต่อเนื่อง"))
    print("🔄 เริ่ม Continuous Mode (MOCK)")

    try:
        while continuous_mode:
            await websocket.send(create_response(
                "info",
                message="👆 [MOCK] กรุณาวางนิ้ว... (กด Stop เพื่อหยุด)"
            ))

            # จำลองเวลาสแกน
            await asyncio.sleep(CONTINUOUS_INTERVAL)

            if not continuous_mode:
                break

            raw_data = create_mock_fingerprint()
            image_base64 = base64.b64encode(raw_data).decode("utf-8")

            response = create_response(
                "captured",
                image=image_base64,
                size=len(raw_data),
                format="png" if HAS_PILLOW else "raw",
                mode="continuous",
            )
            await websocket.send(response)
            print(f"📤 [MOCK][Continuous] ส่ง data: {len(raw_data)} bytes")

            await asyncio.sleep(0.5)

    except websockets.exceptions.ConnectionClosed:
        print("📴 Client ตัดการเชื่อมต่อ")
    finally:
        continuous_mode = False
        print("⏹️  หยุด Continuous Mode")


async def handle_continuous_stop(websocket):
    global continuous_mode
    continuous_mode = False
    await websocket.send(create_response("info", message="⏹️  [MOCK] หยุดสแกนต่อเนื่องแล้ว"))
    print("⏹️  หยุด Continuous Mode (จาก client)")


async def websocket_handler(websocket):
    global connected_clients

    connected_clients.add(websocket)
    print(f"🔗 Client เชื่อมต่อ (รวม: {len(connected_clients)} clients)")

    await websocket.send(create_response(
        "info",
        message="🧪 [MOCK] Fingerprint Agent พร้อมใช้งาน (จำลอง)",
        agentVersion="1.0.0-mock",
    ))

    try:
        async for message in websocket:
            try:
                cmd = json.loads(message)
                action = cmd.get("action", "")

                print(f"📨 รับ command: {action}")

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
                    ))

            except json.JSONDecodeError:
                await websocket.send(create_response(
                    "error",
                    message="รูปแบบ JSON ไม่ถูกต้อง",
                ))

    except websockets.exceptions.ConnectionClosedOK:
        pass
    except websockets.exceptions.ConnectionClosedError:
        pass
    finally:
        connected_clients.discard(websocket)
        print(f"📊 เหลือ {len(connected_clients)} clients")


async def main():
    print()
    print("=" * 60)
    print("🧪 MOCK Fingerprint Agent (สำหรับพัฒนาบน Linux)")
    print("=" * 60)
    print(f"📡 WebSocket: ws://{WS_HOST}:{WS_PORT}")
    print(f"🐍 Python:    {sys.version.split()[0]}")
    print(f"🖼️  Pillow:    {'✅ ใช้ PNG' if HAS_PILLOW else '❌ ใช้ raw grayscale'}")
    print("=" * 60)
    print()
    print("✅ Mock Scanner พร้อม — จำลองการสแกนลายนิ้วมือ")
    print(f"   เปิด React App แล้วเชื่อมต่อที่ ws://localhost:{WS_PORT}")
    print()
    print("📌 กด Ctrl+C เพื่อหยุด")
    print("-" * 60)

    async with websockets.serve(
        websocket_handler,
        WS_HOST,
        WS_PORT,
        ping_interval=30,
        ping_timeout=10,
        max_size=5 * 1024 * 1024,
    ) as server:
        print(f"✅ WebSocket Server พร้อม: ws://{WS_HOST}:{WS_PORT}")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n✅ Mock Agent ปิดเรียบร้อย (Ctrl+C)")
