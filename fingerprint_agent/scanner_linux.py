"""
===================================================================
🐧 scanner_linux.py — Linux Fingerprint Scanner (libfprint)
===================================================================

ใช้ libfprint (open-source, มากับ Ubuntu/Debian) ผ่าน GObject Introspection
สำหรับอ่านลายนิ้วมือจาก DigitalPersona U.are.U 4500 บน Linux

ข้อกำหนด:
1. ติดตั้ง: sudo apt install libfprint-2-2 fprintd gir1.2-fprint-2.0
2. เสียบ U.are.U 4500 ผ่าน USB
3. ผู้ใช้ต้องอยู่ใน group 'plugdev' (ปกติ Ubuntu เพิ่มให้อัตโนมัติ)

สถาปัตยกรรม:
[U.are.U 4500] → [libfprint / uru4000 driver] → [GObject] → [Python]

libfprint รองรับ U.are.U 4500 ผ่าน driver "uru4000"
Device ID: 05ba:000a (DigitalPersona U.are.U 4500)

===================================================================
"""

import logging
import io

logger = logging.getLogger("scanner")

try:
    import gi
    gi.require_version('FPrint', '2.0')
    from gi.repository import FPrint
    HAS_FPRINT = True
except (ImportError, ValueError) as e:
    HAS_FPRINT = False
    logger.warning(f"⚠️  ไม่สามารถโหลด libfprint: {e}")

try:
    from PIL import Image
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False


class FingerprintScanner:
    """
    Class สำหรับจัดการ DigitalPersona U.are.U 4500 ผ่าน libfprint บน Linux

    Usage:
        scanner = FingerprintScanner()
        scanner.open()
        image_bytes = scanner.capture()  # รอจนกว่าจะวางนิ้ว
        scanner.close()
    """

    def __init__(self):
        if not HAS_FPRINT:
            raise RuntimeError(
                "❌ ไม่สามารถโหลด libfprint ได้\n"
                "ติดตั้ง:\n"
                "  sudo apt install libfprint-2-2 fprintd gir1.2-fprint-2.0 -y\n"
            )

        self._ctx = FPrint.Context()
        self._device = None
        self._is_open = False
        logger.info("📦 โหลด libfprint สำเร็จ")

    def check_devices(self):
        """
        ตรวจสอบว่ามี fingerprint scanner เสียบอยู่หรือไม่

        Returns:
            int: จำนวน scanner ที่พบ
        """
        devices = self._ctx.get_devices()
        count = len(devices)

        if count > 0:
            for i, dev in enumerate(devices):
                dev_id = dev.get_driver()
                dev_name = dev.get_name() if hasattr(dev, 'get_name') else dev_id
                logger.info(f"🔍 Scanner {i+1}: {dev_name} (driver: {dev_id})")
        else:
            logger.warning("⚠️  ไม่พบ fingerprint scanner")

        logger.info(f"🔍 พบ fingerprint scanner {count} เครื่อง")
        return count

    def open(self):
        """
        เปิด device สำหรับสแกนลายนิ้วมือ

        Raises:
            RuntimeError: ถ้าไม่พบ scanner หรือเปิดไม่สำเร็จ
        """
        if self._is_open:
            logger.warning("⚠️  Device เปิดอยู่แล้ว")
            return

        devices = self._ctx.get_devices()

        if len(devices) == 0:
            raise RuntimeError(
                "❌ ไม่พบ fingerprint scanner\n"
                "ตรวจสอบว่า:\n"
                "1. เสียบ U.are.U 4500 แล้ว\n"
                "2. รัน: lsusb | grep -i digital\n"
                "3. ติดตั้ง driver: sudo apt install libfprint-2-2"
            )

        self._device = devices[0]

        try:
            self._device.open_sync()
        except Exception as e:
            raise RuntimeError(
                f"❌ ไม่สามารถเปิด scanner ได้: {e}\n"
                "ลองแก้ไข:\n"
                "1. sudo usermod -aG plugdev $USER (แล้ว logout/login ใหม่)\n"
                "2. หรือรันด้วย sudo"
            )

        self._is_open = True

        dev_name = self._device.get_driver()
        logger.info(f"✅ เปิด scanner สำเร็จ: {dev_name}")

    def capture(self):
        """
        อ่านลายนิ้วมือ 1 ครั้ง (blocking — รอจนกว่าจะวางนิ้ว)

        libfprint จะ:
        1. เปิด sensor
        2. รอจนตรวจจับนิ้ว
        3. สแกนภาพ
        4. ส่งกลับเป็น FPrint.Image

        Returns:
            bytes: Fingerprint image (PNG ถ้ามี Pillow, raw grayscale ถ้าไม่มี)

        Raises:
            RuntimeError: ถ้า device ยังไม่เปิด หรือ capture ล้มเหลว
        """
        if not self._is_open or not self._device:
            raise RuntimeError("❌ ต้องเรียก open() ก่อน capture()")

        logger.info("👆 กรุณาวางนิ้วบน Scanner...")

        try:
            # capture_sync(wait_for_finger=True) — รอจนกว่านิ้วจะวาง
            image = self._device.capture_sync(wait_for_finger=True)
        except Exception as e:
            error_msg = str(e)

            if "not-supported" in error_msg.lower() or "not supported" in error_msg.lower():
                raise RuntimeError(
                    "❌ Scanner นี้ไม่รองรับ raw capture ผ่าน libfprint\n"
                    "ลอง: ใช้ fprintd-enroll / fprintd-verify แทน"
                )

            raise RuntimeError(f"❌ Capture ล้มเหลว: {e}")

        if image is None:
            raise RuntimeError("❌ ไม่ได้ภาพลายนิ้วมือ (image is None)")

        # --- Extract raw data จาก FPrint.Image ---
        raw_data = image.get_data()
        width = image.get_width()
        height = image.get_height()

        logger.info(f"✅ สแกนสำเร็จ — {width}x{height}, {len(raw_data)} bytes")

        # แปลงเป็น PNG (ถ้ามี Pillow)
        if HAS_PILLOW and width > 0 and height > 0:
            try:
                pil_image = Image.frombytes("L", (width, height), bytes(raw_data))
                buf = io.BytesIO()
                pil_image.save(buf, format="PNG")
                png_bytes = buf.getvalue()
                logger.info(f"📋 แปลงเป็น PNG: {len(png_bytes)} bytes")
                return png_bytes
            except Exception as e:
                logger.warning(f"⚠️  แปลง PNG ไม่สำเร็จ: {e} — ส่ง raw data แทน")

        return bytes(raw_data)

    def close(self):
        """ปิด scanner — เรียกเสมอเมื่อใช้เสร็จ"""
        if self._is_open and self._device:
            try:
                self._device.close_sync()
                logger.info("🔒 ปิด scanner สำเร็จ")
            except Exception as e:
                logger.warning(f"⚠️  ปิด scanner ไม่สำเร็จ: {e}")
            self._is_open = False
            self._device = None

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
# Standalone Test
# ===================================================================

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    print("=" * 60)
    print("🐧 DigitalPersona U.are.U 4500 — Linux (libfprint) Test")
    print("=" * 60)
    print()

    scanner = FingerprintScanner()

    count = scanner.check_devices()
    if count == 0:
        print("❌ ไม่พบ fingerprint scanner — กรุณาเสียบ U.are.U 4500")
        print("   ตรวจสอบ: lsusb | grep -i digital")
        exit(1)

    try:
        with scanner:
            raw_data = scanner.capture()
            print(f"\n✅ ได้ข้อมูลลายนิ้วมือ: {len(raw_data)} bytes")
            print(f"   First 20 bytes (hex): {raw_data[:20].hex()}")

            # บันทึกเป็นไฟล์ PNG (ถ้า Pillow แปลงให้แล้ว)
            with open("test_fingerprint.png", "wb") as f:
                f.write(raw_data)
            print("   💾 บันทึกไว้ที่ test_fingerprint.png")

    except RuntimeError as e:
        print(f"\n{e}")
    except PermissionError as e:
        print(f"\n{e}")
