# ===================================================================
# ⚙️ Configuration — Python Local Agent
# ===================================================================

# --- WebSocket Server ---
WS_HOST = "localhost"
WS_PORT = 8765

# --- Scanner ---
# Timeout สำหรับรอนิ้ววาง (วินาที) — 0 = ไม่มี timeout
CAPTURE_TIMEOUT_MS = 10000  # 10 วินาที

# --- Continuous Mode ---
# ระยะเวลาระหว่างการ scan แต่ละครั้ง (วินาที)
CONTINUOUS_INTERVAL = 0.5

# --- Image ---
# DPI ของ U.are.U 4500 (ค่าจาก spec sheet)
SCANNER_DPI = 512

# --- Logging ---
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR
