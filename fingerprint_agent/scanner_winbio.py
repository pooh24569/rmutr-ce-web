"""
===================================================================
🔷 scanner_winbio.py — Windows Biometric Framework Wrapper
===================================================================

ใช้ ctypes เรียก winbio.dll (ฟรี ติดมากับ Windows 10/11)
สำหรับอ่านลายนิ้วมือจาก DigitalPersona U.are.U 4500

ข้อกำหนด:
1. ต้องรันด้วยสิทธิ์ Administrator (WinBio RAW mode ต้องการ)
2. ต้องติดตั้ง WBF Driver สำหรับ U.are.U 4500 ก่อน
3. ใช้ Python 3.10+ (64-bit)

สถาปัตยกรรม:
[U.are.U 4500] → [WBF Driver] → [winbio.dll] → [ctypes] → [Python]

โครงสร้าง WINBIO_BIR (Biometric Information Record):
┌─────────────────────────────────────────┐
│  WINBIO_BIR                              │
│  ├── HeaderBlock    (Size, Offset)       │
│  ├── StandardDataBlock (Size, Offset)    │  ← ข้อมูลลายนิ้วมืออยู่ตรงนี้
│  ├── VendorDataBlock (Size, Offset)      │
│  └── SignatureBlock  (Size, Offset)      │
│  ─── [Header bytes] ─── [Data bytes] ── │
└─────────────────────────────────────────┘

Offset = ตำแหน่ง byte นับจาก address แรกของ WINBIO_BIR
Size   = ขนาด byte ของ block นั้น

===================================================================
"""

import ctypes
import ctypes.wintypes as wintypes
import logging
import io

logger = logging.getLogger("scanner")

# ===================================================================
# 1. WinBio Constants (จาก winbio.h header file)
# ===================================================================

# --- Biometric Types ---
WINBIO_TYPE_FINGERPRINT = 0x00000008

# --- Pool Types ---
WINBIO_POOL_SYSTEM = 0x00000001

# --- Session Flags ---
WINBIO_FLAG_RAW = 0x00000001

# --- BIR Purpose ---
WINBIO_NO_PURPOSE_AVAILABLE = 0x00
WINBIO_PURPOSE_VERIFY = 0x01
WINBIO_PURPOSE_IDENTIFY = 0x02
WINBIO_PURPOSE_ENROLL = 0x04

# --- Data Flags ---
WINBIO_DATA_FLAG_RAW = 0x20
WINBIO_DATA_FLAG_INTERMEDIATE = 0x40
WINBIO_DATA_FLAG_PROCESSED = 0x80

# --- Database ---
# WINBIO_DB_DEFAULT = GUID {00000000-0000-0000-0000-000000000001}
# ใช้ None (NULL) แทนได้ สำหรับ POOL_SYSTEM

# --- HRESULT Codes ---
S_OK = 0x00000000
WINBIO_E_BAD_CAPTURE = 0x80098005
WINBIO_E_ENROLLMENT_IN_PROGRESS = 0x80098007
E_ACCESSDENIED = 0x80070005

# --- Reject Detail Codes ---
REJECT_REASONS = {
    0: "สำเร็จ",
    1: "นิ้วอยู่สูงเกินไป (TOO_HIGH)",
    2: "นิ้วอยู่ต่ำเกินไป (TOO_LOW)",
    3: "นิ้วอยู่ซ้ายเกินไป (TOO_LEFT)",
    4: "นิ้วอยู่ขวาเกินไป (TOO_RIGHT)",
    5: "เลื่อนนิ้วเร็วเกินไป (TOO_FAST)",
    6: "เลื่อนนิ้วช้าเกินไป (TOO_SLOW)",
    7: "คุณภาพภาพไม่ดี (POOR_QUALITY)",
    8: "นิ้วเอียงเกินไป (TOO_SKEWED)",
    9: "นิ้วสั้นเกินไป (TOO_SHORT)",
    10: "รวมภาพไม่สำเร็จ (MERGE_FAILURE)",
}


# ===================================================================
# 2. ctypes Structure Definitions
# ===================================================================

class WINBIO_BIR_DATA(ctypes.Structure):
    """
    โครงสร้างข้อมูลย่อยของ WINBIO_BIR
    ระบุตำแหน่ง (Offset) และขนาด (Size) ของแต่ละ block
    """
    _fields_ = [
        ("Size", ctypes.c_uint32),    # ขนาด block เป็น bytes
        ("Offset", ctypes.c_uint32),  # ตำแหน่ง byte นับจากต้น WINBIO_BIR
    ]


class WINBIO_BIR(ctypes.Structure):
    """
    Biometric Information Record (BIR)
    โครงสร้างหลักที่ WinBioCaptureSample ส่งกลับมา

    ข้อมูล fingerprint image อยู่ใน StandardDataBlock
    """
    _fields_ = [
        ("HeaderBlock", WINBIO_BIR_DATA),         # ข้อมูล header (format type)
        ("StandardDataBlock", WINBIO_BIR_DATA),   # ข้อมูลลายนิ้วมือ ← ตรงนี้!
        ("VendorDataBlock", WINBIO_BIR_DATA),     # ข้อมูลเฉพาะ vendor
        ("SignatureBlock", WINBIO_BIR_DATA),      # digital signature
    ]


# ===== Type Aliases =====
WINBIO_SESSION_HANDLE = ctypes.c_void_p
WINBIO_UNIT_ID = wintypes.ULONG
WINBIO_REJECT_DETAIL = wintypes.ULONG
PWINBIO_BIR = ctypes.POINTER(WINBIO_BIR)


# ===================================================================
# 3. WinBio DLL Function Bindings
# ===================================================================

def _load_winbio():
    """
    โหลด winbio.dll และกำหนด function signatures

    winbio.dll มาพร้อม Windows 10/11 ฟรี
    ไม่ต้องติดตั้ง SDK เพิ่ม
    """
    try:
        winbio = ctypes.WinDLL("winbio.dll")
    except OSError as e:
        raise RuntimeError(
            "ไม่สามารถโหลด winbio.dll ได้\n"
            "ตรวจสอบว่า:\n"
            "1. ใช้ Windows 10/11\n"
            "2. Windows Biometric Service กำลังทำงาน\n"
            f"Error: {e}"
        )

    # --- WinBioOpenSession ---
    winbio.WinBioOpenSession.argtypes = [
        wintypes.ULONG,                           # Factor (WINBIO_TYPE_FINGERPRINT)
        wintypes.ULONG,                           # PoolType (WINBIO_POOL_SYSTEM)
        wintypes.ULONG,                           # Flags (WINBIO_FLAG_RAW)
        ctypes.c_void_p,                          # UnitArray (NULL)
        ctypes.c_size_t,                          # UnitCount (0)
        ctypes.c_void_p,                          # DatabaseId (NULL)
        ctypes.POINTER(WINBIO_SESSION_HANDLE),    # SessionHandle (out)
    ]
    winbio.WinBioOpenSession.restype = wintypes.LONG

    # --- WinBioCaptureSample ---
    winbio.WinBioCaptureSample.argtypes = [
        WINBIO_SESSION_HANDLE,                     # SessionHandle
        wintypes.ULONG,                            # Purpose
        wintypes.ULONG,                            # Flags
        ctypes.POINTER(WINBIO_UNIT_ID),            # UnitId (out)
        ctypes.POINTER(ctypes.c_void_p),           # Sample (out) — PWINBIO_BIR*
        ctypes.POINTER(ctypes.c_size_t),           # SampleSize (out)
        ctypes.POINTER(WINBIO_REJECT_DETAIL),      # RejectDetail (out)
    ]
    winbio.WinBioCaptureSample.restype = wintypes.LONG

    # --- WinBioCloseSession ---
    winbio.WinBioCloseSession.argtypes = [WINBIO_SESSION_HANDLE]
    winbio.WinBioCloseSession.restype = wintypes.LONG

    # --- WinBioFree ---
    winbio.WinBioFree.argtypes = [ctypes.c_void_p]
    winbio.WinBioFree.restype = wintypes.LONG

    # --- WinBioEnumBiometricUnits ---
    winbio.WinBioEnumBiometricUnits.argtypes = [
        wintypes.ULONG,                            # Factor
        ctypes.POINTER(ctypes.c_void_p),           # UnitSchemaArray (out)
        ctypes.POINTER(ctypes.c_size_t),           # UnitCount (out)
    ]
    winbio.WinBioEnumBiometricUnits.restype = wintypes.LONG

    return winbio


# ===================================================================
# 4. Scanner Class — หัวใจหลักของ Agent
# ===================================================================

class FingerprintScanner:
    """
    Class สำหรับจัดการ DigitalPersona U.are.U 4500 ผ่าน WinBio API

    Usage:
        scanner = FingerprintScanner()
        scanner.open()
        image_bytes = scanner.capture()  # รอจนกว่าจะวางนิ้ว
        scanner.close()
    """

    def __init__(self):
        self._winbio = _load_winbio()
        self._session_handle = WINBIO_SESSION_HANDLE(0)
        self._is_open = False
        logger.info("📦 โหลด winbio.dll สำเร็จ")

    def check_devices(self):
        """
        ตรวจสอบว่ามี fingerprint scanner เสียบอยู่หรือไม่

        Returns:
            int: จำนวน scanner ที่พบ
        """
        unit_array = ctypes.c_void_p(0)
        unit_count = ctypes.c_size_t(0)

        hr = self._winbio.WinBioEnumBiometricUnits(
            WINBIO_TYPE_FINGERPRINT,
            ctypes.byref(unit_array),
            ctypes.byref(unit_count),
        )

        if hr != S_OK:
            logger.warning(f"⚠️  ไม่สามารถตรวจสอบ scanner ได้ (HRESULT: {hex(hr & 0xFFFFFFFF)})")
            return 0

        count = unit_count.value
        logger.info(f"🔍 พบ fingerprint scanner {count} เครื่อง")

        # Free memory
        if unit_array.value:
            self._winbio.WinBioFree(unit_array)

        return count

    def open(self):
        """
        เปิด session กับ WinBio (ต้องรันด้วยสิทธิ์ Administrator)

        ใช้ WINBIO_FLAG_RAW เพื่อให้สามารถอ่าน raw fingerprint data ได้
        ถ้าไม่ใช้ RAW จะอ่านได้เฉพาะ verify/identify result เท่านั้น

        Raises:
            PermissionError: ถ้าไม่ได้รันด้วยสิทธิ์ Administrator
            RuntimeError: ถ้าเปิด session ไม่สำเร็จ
        """
        if self._is_open:
            logger.warning("⚠️  Session เปิดอยู่แล้ว")
            return

        hr = self._winbio.WinBioOpenSession(
            WINBIO_TYPE_FINGERPRINT,   # ใช้ fingerprint
            WINBIO_POOL_SYSTEM,        # ใช้ system pool (ทุก scanner ที่ลงทะเบียนกับ Windows)
            WINBIO_FLAG_RAW,           # ต้อง RAW ถึงจะอ่าน image data ได้
            None,                       # UnitArray = NULL (ใช้ทุกตัว)
            0,                          # UnitCount = 0
            None,                       # DatabaseId = NULL (ใช้ default)
            ctypes.byref(self._session_handle),
        )

        if hr != S_OK:
            hr_hex = hex(hr & 0xFFFFFFFF)

            if (hr & 0xFFFFFFFF) == (E_ACCESSDENIED & 0xFFFFFFFF):
                raise PermissionError(
                    "❌ ต้องรัน Python ด้วยสิทธิ์ Administrator!\n"
                    "วิธีแก้: คลิกขวาที่ Command Prompt → 'Run as administrator'\n"
                    "แล้วรัน: python agent.py"
                )

            raise RuntimeError(
                f"❌ ไม่สามารถเปิด WinBio Session ได้ (HRESULT: {hr_hex})\n"
                "ตรวจสอบว่า:\n"
                "1. เสียบ U.are.U 4500 แล้ว\n"
                "2. ติดตั้ง WBF Driver แล้ว\n"
                "3. Windows Biometric Service กำลังทำงาน\n"
                "   (services.msc → Windows Biometric Service → Start)"
            )

        self._is_open = True
        logger.info("✅ เปิด WinBio Session สำเร็จ (RAW mode)")

    def capture(self):
        """
        อ่านลายนิ้วมือ 1 ครั้ง (blocking — รอจนกว่าจะวางนิ้ว)

        ขั้นตอน:
        1. เรียก WinBioCaptureSample() — รอจนนิ้ววาง
        2. Parse WINBIO_BIR structure
        3. Extract raw data จาก StandardDataBlock
        4. Free memory
        5. Return raw bytes

        Returns:
            bytes: Raw fingerprint data (ANSI 381 format หรือ vendor-specific)

        Raises:
            RuntimeError: ถ้า session ยังไม่เปิด หรือ capture ล้มเหลว
        """
        if not self._is_open:
            raise RuntimeError("❌ ต้องเรียก open() ก่อน capture()")

        # --- เตรียมตัวแปรรับผลลัพธ์ ---
        unit_id = WINBIO_UNIT_ID(0)
        sample_ptr = ctypes.c_void_p(0)       # PWINBIO_BIR*
        sample_size = ctypes.c_size_t(0)
        reject_detail = WINBIO_REJECT_DETAIL(0)

        logger.info("👆 กรุณาวางนิ้วบน Scanner...")

        # --- เรียก WinBioCaptureSample (blocking) ---
        hr = self._winbio.WinBioCaptureSample(
            self._session_handle,
            WINBIO_NO_PURPOSE_AVAILABLE,    # Purpose
            WINBIO_DATA_FLAG_RAW,           # Flags — ขอ raw data
            ctypes.byref(unit_id),
            ctypes.byref(sample_ptr),
            ctypes.byref(sample_size),
            ctypes.byref(reject_detail),
        )

        # --- ตรวจสอบผลลัพธ์ ---
        if hr != S_OK:
            hr_hex = hex(hr & 0xFFFFFFFF)

            if (hr & 0xFFFFFFFF) == (WINBIO_E_BAD_CAPTURE & 0xFFFFFFFF):
                reason = REJECT_REASONS.get(reject_detail.value, f"รหัส {reject_detail.value}")
                raise RuntimeError(f"⚠️  ภาพไม่ดีพอ: {reason}")

            raise RuntimeError(f"❌ WinBioCaptureSample ล้มเหลว (HRESULT: {hr_hex})")

        logger.info(f"✅ สแกนสำเร็จ — Unit: {unit_id.value}, ขนาด: {sample_size.value} bytes")

        try:
            # --- Parse WINBIO_BIR Structure ---
            raw_data = self._extract_bir_data(sample_ptr.value, sample_size.value)
            return raw_data
        finally:
            # --- Free Memory (สำคัญมาก! ไม่งั้น memory leak) ---
            if sample_ptr.value:
                self._winbio.WinBioFree(sample_ptr)
                logger.debug("🗑️  Free sample memory สำเร็จ")

    def _extract_bir_data(self, bir_address, total_size):
        """
        แกะข้อมูลจาก WINBIO_BIR Structure

        WINBIO_BIR ใช้ offset-based layout:
        ┌──────────────────────────────────────────────┐
        │  [BIR struct (32 bytes)]                      │
        │  [Header data at HeaderBlock.Offset]          │
        │  [Standard data at StandardDataBlock.Offset]  │  ← target
        │  [Vendor data at VendorDataBlock.Offset]      │
        │  [Signature at SignatureBlock.Offset]         │
        └──────────────────────────────────────────────┘

        Args:
            bir_address: Memory address ของ WINBIO_BIR
            total_size: ขนาดรวมทั้งหมด (bytes)

        Returns:
            bytes: Raw fingerprint data จาก StandardDataBlock
        """
        if not bir_address:
            raise RuntimeError("❌ BIR address เป็น NULL")

        # Cast address เป็น WINBIO_BIR*
        bir = ctypes.cast(bir_address, ctypes.POINTER(WINBIO_BIR)).contents

        # --- Log ข้อมูล BIR ---
        logger.debug(f"  HeaderBlock:       Size={bir.HeaderBlock.Size}, Offset={bir.HeaderBlock.Offset}")
        logger.debug(f"  StandardDataBlock: Size={bir.StandardDataBlock.Size}, Offset={bir.StandardDataBlock.Offset}")
        logger.debug(f"  VendorDataBlock:   Size={bir.VendorDataBlock.Size}, Offset={bir.VendorDataBlock.Offset}")
        logger.debug(f"  SignatureBlock:    Size={bir.SignatureBlock.Size}, Offset={bir.SignatureBlock.Offset}")

        # --- Extract StandardDataBlock (ข้อมูลลายนิ้วมือ) ---
        std_block = bir.StandardDataBlock

        if std_block.Size == 0:
            # ถ้า StandardDataBlock ว่าง ลองใช้ VendorDataBlock แทน
            logger.warning("⚠️  StandardDataBlock ว่าง — ลองใช้ VendorDataBlock")
            std_block = bir.VendorDataBlock

        if std_block.Size == 0:
            raise RuntimeError(
                "❌ ไม่พบข้อมูลลายนิ้วมือใน BIR\n"
                "อาจเป็นเพราะ WBF driver ของ U.are.U 4500 ไม่รองรับ RAW capture\n"
                "ลองใช้ WINBIO_DATA_FLAG_INTERMEDIATE แทน"
            )

        # ตรวจสอบ bounds
        if std_block.Offset + std_block.Size > total_size:
            raise RuntimeError(
                f"❌ BIR data offset เกินขอบเขต: "
                f"Offset({std_block.Offset}) + Size({std_block.Size}) > Total({total_size})"
            )

        # อ่าน raw bytes จาก memory
        data_address = bir_address + std_block.Offset
        raw_data = ctypes.string_at(data_address, std_block.Size)

        logger.info(f"📋 Extract สำเร็จ: {len(raw_data)} bytes จาก BIR")

        return raw_data

    def close(self):
        """ปิด WinBio Session — เรียกเสมอเมื่อใช้เสร็จ"""
        if self._is_open and self._session_handle.value:
            hr = self._winbio.WinBioCloseSession(self._session_handle)
            if hr == S_OK:
                logger.info("🔒 ปิด WinBio Session สำเร็จ")
            else:
                logger.warning(f"⚠️  ปิด Session ไม่สำเร็จ (HRESULT: {hex(hr & 0xFFFFFFFF)})")
            self._is_open = False
            self._session_handle = WINBIO_SESSION_HANDLE(0)

    def __enter__(self):
        self.open()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        return False

    @property
    def is_connected(self):
        return self._is_open


# ===================================================================
# 5. Standalone Test
# ===================================================================

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    print("=" * 60)
    print("🔷 DigitalPersona U.are.U 4500 — WinBio Test")
    print("=" * 60)
    print("⚠️  ต้องรันด้วยสิทธิ์ Administrator!")
    print()

    scanner = FingerprintScanner()

    # ตรวจสอบ scanner
    count = scanner.check_devices()
    if count == 0:
        print("❌ ไม่พบ fingerprint scanner — กรุณาเสียบ U.are.U 4500")
        exit(1)

    # ทดสอบ capture
    try:
        with scanner:
            raw_data = scanner.capture()
            print(f"\n✅ ได้ข้อมูลลายนิ้วมือ: {len(raw_data)} bytes")
            print(f"   First 20 bytes (hex): {raw_data[:20].hex()}")
    except PermissionError as e:
        print(f"\n{e}")
    except RuntimeError as e:
        print(f"\n{e}")
