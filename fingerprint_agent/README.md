# 🔷 คู่มือติดตั้ง — Fingerprint Local Agent (Windows)

## สิ่งที่ต้องมี

| รายการ | เวอร์ชัน | ค่าใช้จ่าย |
|---|---|---|
| Windows 10/11 | 64-bit | ✅ ฟรี |
| Python | 3.10+ (64-bit) | ✅ ฟรี |
| DigitalPersona U.are.U 4500 | USB Scanner | มีอยู่แล้ว |
| WBF Driver สำหรับ U.are.U 4500 | - | ✅ ฟรี |

---

## ขั้นตอนที่ 1: ติดตั้ง Python

1. ดาวน์โหลด Python 3.10+ จาก https://www.python.org/downloads/
2. **สำคัญ**: ติ๊ก ✅ "Add Python to PATH" ตอนติดตั้ง
3. ตรวจสอบ: เปิด CMD พิมพ์ `python --version`

---

## ขั้นตอนที่ 2: ติดตั้ง WBF Driver สำหรับ U.are.U 4500

1. เสียบ U.are.U 4500 เข้า USB
2. Windows จะติดตั้ง driver อัตโนมัติ (ส่วนใหญ่)
3. ตรวจสอบ: เปิด Device Manager → Biometric devices → ต้องเห็น DigitalPersona

**ถ้า Windows ไม่ติดตั้ง driver อัตโนมัติ:**
- ไปที่ https://www.hidglobal.com/drivers
- ค้นหา "U.are.U 4500" → ดาวน์โหลด WBF Driver
- ติดตั้งและ restart

---

## ขั้นตอนที่ 3: เปิด Windows Biometric Service

1. กด `Win + R` → พิมพ์ `services.msc` → Enter
2. ค้นหา "Windows Biometric Service"
3. คลิกขวา → Properties → Startup type: **Automatic**
4. คลิก **Start** (ถ้ายังไม่ทำงาน)

---

## ขั้นตอนที่ 4: ติดตั้ง Python Dependencies

```powershell
# เปิด Command Prompt (ไม่ต้อง Admin ตอนนี้)
cd fingerprint_agent
pip install -r requirements.txt
```

---

## ขั้นตอนที่ 5: รัน Agent

```powershell
# ⚠️ ต้องเปิด Command Prompt ด้วยสิทธิ์ Administrator!
# คลิกขวาที่ Command Prompt → Run as administrator

cd fingerprint_agent
python agent.py
```

ถ้าสำเร็จจะเห็น:
```
============================================================
🔷 Fingerprint Agent — DigitalPersona U.are.U 4500
============================================================
📡 WebSocket: ws://localhost:8765
🐍 Python:    3.10.x
💻 Platform:  win32
============================================================

✅ พบ scanner 1 เครื่อง

🚀 กำลังเริ่ม WebSocket Server...
   เปิด React App แล้วเชื่อมต่อที่ ws://localhost:8765
```

---

## ทดสอบ Scanner อย่างเดียว (ไม่ต้อง WebSocket)

```powershell
# ทดสอบว่า scanner อ่านลายนิ้วมือได้
python scanner_winbio.py
```

---

## Troubleshooting

### ❌ "ต้องรัน Python ด้วยสิทธิ์ Administrator!"
→ คลิกขวา Command Prompt → Run as administrator

### ❌ "ไม่สามารถโหลด winbio.dll ได้"
→ ใช้ Windows 10/11 เท่านั้น (Windows 7 ไม่รองรับ WBF อย่างเต็มที่)

### ❌ "ไม่พบ fingerprint scanner"
→ ตรวจ Device Manager ว่ามี Biometric devices
→ ตรวจ Windows Biometric Service ว่า running

### ❌ "WinBioCaptureSample ล้มเหลว"
→ ลองถอด-เสียบ scanner ใหม่
→ Restart Windows Biometric Service

### ❌ "StandardDataBlock ว่าง"
→ WBF driver ของ U.are.U 4500 บางเวอร์ชันไม่รองรับ RAW capture
→ ลองอัปเดต driver จาก HID Global
