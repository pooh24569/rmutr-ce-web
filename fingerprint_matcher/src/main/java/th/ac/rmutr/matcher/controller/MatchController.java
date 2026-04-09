package th.ac.rmutr.matcher.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import th.ac.rmutr.matcher.service.FingerprintService;

import java.util.List;
import java.util.Map;

/**
 * ===================================================================
 * 🌐 MatchController — REST API สำหรับ Fingerprint Matching
 * ===================================================================
 *
 * Endpoints:
 * POST /api/extract-template  → แปลง image → template
 * POST /api/match-1to1        → เทียบ 1:1 (verify)
 * POST /api/match-1toN        → เทียบ 1:N (identify)
 * GET  /api/health            → ตรวจสอบ service status
 *
 * เรียกจาก Express API (fingerprintController.js)
 *
 * ===================================================================
 */
@RestController
@RequestMapping("/api")
public class MatchController {

    private static final Logger logger = LoggerFactory.getLogger(MatchController.class);

    private final FingerprintService fingerprintService;

    public MatchController(FingerprintService fingerprintService) {
        this.fingerprintService = fingerprintService;
    }

    /**
     * Health Check — ตรวจสอบว่า service พร้อมใช้งาน
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "SourceAFIS Fingerprint Matcher",
                "version", "1.0.0"
        ));
    }

    /**
     * Extract Template — แปลง fingerprint image เป็น template
     *
     * Request Body:
     * {
     *   "image": "base64-encoded-image-data"
     * }
     *
     * Response:
     * {
     *   "template": "base64-encoded-template",
     *   "success": true
     * }
     */
    @PostMapping("/extract-template")
    public ResponseEntity<Map<String, Object>> extractTemplate(
            @RequestBody Map<String, String> request
    ) {
        try {
            String imageBase64 = request.get("image");

            if (imageBase64 == null || imageBase64.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing 'image' field in request body"
                ));
            }

            String template = fingerprintService.extractTemplate(imageBase64);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "template", template
            ));

        } catch (Exception e) {
            logger.error("Extract template failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to extract template: " + e.getMessage()
            ));
        }
    }

    /**
     * Match 1:1 — เทียบลายนิ้วมือกับ template เฉพาะ (Verification)
     *
     * Request Body:
     * {
     *   "probeImage": "base64-image",
     *   "candidateTemplate": "base64-template",
     *   "threshold": 40  (optional)
     * }
     *
     * Response:
     * {
     *   "matched": true/false,
     *   "score": 85.3,
     *   "threshold": 40
     * }
     */
    @PostMapping("/match-1to1")
    public ResponseEntity<Map<String, Object>> match1to1(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String probeImage = (String) request.get("probeImage");
            String candidateTemplate = (String) request.get("candidateTemplate");
            Double threshold = request.get("threshold") != null
                    ? ((Number) request.get("threshold")).doubleValue()
                    : null;

            if (probeImage == null || candidateTemplate == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing 'probeImage' or 'candidateTemplate'"
                ));
            }

            Map<String, Object> result = fingerprintService.match1to1(
                    probeImage, candidateTemplate, threshold
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Match 1:1 failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Match failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Match 1:N — ค้นหาลายนิ้วมือจาก list ของ candidates (Identification)
     *
     * Request Body:
     * {
     *   "probeImage": "base64-image",
     *   "candidates": [
     *     { "studentId": "abc123", "template": "base64-template" },
     *     { "studentId": "def456", "template": "base64-template" }
     *   ],
     *   "threshold": 40  (optional)
     * }
     *
     * Response:
     * {
     *   "matched": true,
     *   "matchedStudentId": "abc123",
     *   "score": 92.1,
     *   "threshold": 40,
     *   "candidateCount": 45,
     *   "elapsedMs": 87
     * }
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/match-1toN")
    public ResponseEntity<Map<String, Object>> match1toN(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String probeImage = (String) request.get("probeImage");
            List<Map<String, String>> candidates =
                    (List<Map<String, String>>) request.get("candidates");
            Double threshold = request.get("threshold") != null
                    ? ((Number) request.get("threshold")).doubleValue()
                    : null;

            if (probeImage == null || candidates == null || candidates.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing 'probeImage' or 'candidates'"
                ));
            }

            Map<String, Object> result = fingerprintService.match1toN(
                    probeImage, candidates, threshold
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Match 1:N failed", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Match failed: " + e.getMessage()
            ));
        }
    }
}
