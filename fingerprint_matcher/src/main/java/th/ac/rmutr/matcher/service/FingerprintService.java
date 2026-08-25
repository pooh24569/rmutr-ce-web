package th.ac.rmutr.matcher.service;

import com.machinezoo.sourceafis.FingerprintImage;
import com.machinezoo.sourceafis.FingerprintImageOptions;
import com.machinezoo.sourceafis.FingerprintMatcher;
import com.machinezoo.sourceafis.FingerprintTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Map;

/**
 * ===================================================================
 * 🔐 FingerprintService — SourceAFIS Matching Engine
 * ===================================================================
 *
 * ใช้ SourceAFIS (Apache 2.0) สำหรับ:
 * 1. แปลง fingerprint image → template (minutiae extraction)
 * 2. เทียบ template 1:1 (verification)
 * 3. เทียบ template 1:N (identification)
 *
 * SourceAFIS ทำอะไร:
 * - วิเคราะห์ภาพลายนิ้วมือ → หาจุด minutiae (จุดแยก/จุดจบของลาย)
 * - สร้าง template (ข้อมูลเชิงตัวเลขของจุด minutiae)
 * - เทียบ template 2 ชุด → คะแนนความเหมือน (similarity score)
 *
 * ===================================================================
 */
@Service
public class FingerprintService {

    private static final Logger logger = LoggerFactory.getLogger(FingerprintService.class);

    @Value("${matcher.threshold:40}")
    private double matchThreshold;

    @Value("${matcher.scanner-dpi:512}")
    private int scannerDpi;

    /**
     * แปลง fingerprint image (base64) → template (base64)
     *
     * ขั้นตอน:
     * 1. Decode base64 → raw bytes
     * 2. สร้าง FingerprintImage (กำหนด DPI ของ scanner)
     * 3. Extract template (SourceAFIS วิเคราะห์ minutiae)
     * 4. Serialize template → base64
     *
     * @param imageBase64 ภาพลายนิ้วมือ (PNG/grayscale) ใน base64
     * @return template ใน base64
     */
    public String extractTemplate(String imageBase64) {
        logger.debug("Extracting template from image ({} chars)", imageBase64.length());

        byte[] imageBytes = Base64.getDecoder().decode(imageBase64);

        // สร้าง FingerprintImage — SourceAFIS รองรับ PNG/JPEG/BMP/grayscale
        FingerprintImage image = new FingerprintImage(
                imageBytes,
                new FingerprintImageOptions().dpi(scannerDpi)
        );

        // Extract template (minutiae analysis)
        FingerprintTemplate template = new FingerprintTemplate(image);

        // Serialize template → byte[] → base64
        byte[] serialized = template.toByteArray();

        logger.info("Template extracted: {} bytes", serialized.length);

        return Base64.getEncoder().encodeToString(serialized);
    }

    /**
     * เทียบ 1:1 (Verification)
     *
     * ใช้เมื่อรู้ว่าเป็นนักศึกษาคนไหน → เทียบกับ template ที่เก็บไว้
     *
     * @param probeImageBase64     ภาพที่เพิ่งสแกน (base64)
     * @param candidateTemplateB64 template จาก DB (base64)
     * @param threshold            คะแนนขั้นต่ำ (null = ใช้ค่า default)
     * @return { matched: boolean, score: double }
     */
    public Map<String, Object> match1to1(
            String probeImageBase64,
            String candidateTemplateB64,
            Double threshold
    ) {
        double useThreshold = (threshold != null) ? threshold : matchThreshold;

        // แปลง probe image → template
        byte[] probeBytes = Base64.getDecoder().decode(probeImageBase64);
        FingerprintImage probeImage = new FingerprintImage(
                probeBytes,
                new FingerprintImageOptions().dpi(scannerDpi)
        );
        FingerprintTemplate probeTemplate = new FingerprintTemplate(probeImage);

        // โหลด candidate template จาก serialized bytes
        byte[] candidateBytes = Base64.getDecoder().decode(candidateTemplateB64);
        FingerprintTemplate candidateTemplate = new FingerprintTemplate(candidateBytes);

        // Match
        FingerprintMatcher matcher = new FingerprintMatcher(probeTemplate);
        double score = matcher.match(candidateTemplate);

        boolean matched = score >= useThreshold;

        logger.info("1:1 Match — Score: {}, Threshold: {}, Matched: {}",
                String.format("%.2f", score), useThreshold, matched);

        return Map.of(
                "matched", matched,
                "score", score,
                "threshold", useThreshold
        );
    }

    /**
     * เทียบ 1:N (Identification)
     *
     * ใช้เมื่อไม่รู้ว่าเป็นใคร → เทียบกับ template ทุกคนใน session
     * สำหรับ class < 100 คน brute-force ก็เร็วพอ (< 100ms)
     *
     * @param probeImageBase64 ภาพที่เพิ่งสแกน (base64)
     * @param candidates       list ของ { studentId, template (base64) }
     * @param threshold        คะแนนขั้นต่ำ (null = ใช้ค่า default)
     * @return { matched, matchedStudentId, score, threshold }
     */
    public Map<String, Object> match1toN(
            String probeImageBase64,
            java.util.List<Map<String, String>> candidates,
            Double threshold
    ) {
        double useThreshold = (threshold != null) ? threshold : matchThreshold;

        logger.info("1:N Match — Probing against {} candidates", candidates.size());
        long startTime = System.currentTimeMillis();

        // แปลง probe image → template
        byte[] probeBytes = Base64.getDecoder().decode(probeImageBase64);
        FingerprintImage probeImage = new FingerprintImage(
                probeBytes,
                new FingerprintImageOptions().dpi(scannerDpi)
        );
        FingerprintTemplate probeTemplate = new FingerprintTemplate(probeImage);

        // สร้าง matcher 1 ครั้ง → ใช้เทียบกับทุก candidate
        FingerprintMatcher matcher = new FingerprintMatcher(probeTemplate);

        String bestStudentId = null;
        double bestScore = 0;

        // Brute-force 1:N — เทียบทุกคน
        for (Map<String, String> candidate : candidates) {
            String studentId = candidate.get("studentId");
            String templateB64 = candidate.get("template");

            try {
                byte[] candidateBytes = Base64.getDecoder().decode(templateB64);
                FingerprintTemplate candidateTemplate = new FingerprintTemplate(candidateBytes);

                double score = matcher.match(candidateTemplate);

                logger.debug("  Student {}: score = {}", studentId, String.format("%.2f", score));

                if (score > bestScore) {
                    bestScore = score;
                    bestStudentId = studentId;
                }
            } catch (Exception e) {
                logger.warn("Failed to match candidate {}: {}", studentId, e.getMessage());
            }
        }

        long elapsed = System.currentTimeMillis() - startTime;
        boolean matched = bestScore >= useThreshold;

        logger.info("1:N Match — Best: {} (score: {}), Matched: {}, Time: {}ms",
                bestStudentId, String.format("%.2f", bestScore), matched, elapsed);

        if (matched) {
            return Map.of(
                    "matched", true,
                    "matchedStudentId", bestStudentId,
                    "score", bestScore,
                    "threshold", useThreshold,
                    "candidateCount", candidates.size(),
                    "elapsedMs", elapsed
            );
        } else {
            return Map.of(
                    "matched", false,
                    "score", bestScore,
                    "threshold", useThreshold,
                    "candidateCount", candidates.size(),
                    "elapsedMs", elapsed
            );
        }
    }
}
