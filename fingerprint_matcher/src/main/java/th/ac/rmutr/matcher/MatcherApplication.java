package th.ac.rmutr.matcher;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ===================================================================
 * ☕ SourceAFIS Fingerprint Matching Service
 * ===================================================================
 *
 * Microservice สำหรับ:
 * 1. Extract fingerprint template จาก image
 * 2. Match 1:1 (verify — เทียบกับคนเฉพาะ)
 * 3. Match 1:N (identify — ค้นหาจากทั้งห้อง)
 *
 * ใช้ SourceAFIS library (Apache 2.0 — ฟรี 100%)
 * รันบน Docker port 8090
 *
 * ===================================================================
 */
@SpringBootApplication
public class MatcherApplication {

    public static void main(String[] args) {
        SpringApplication.run(MatcherApplication.class, args);
    }
}
