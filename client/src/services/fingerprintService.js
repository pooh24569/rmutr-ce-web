/**
 * ===================================================================
 * 🔐 Fingerprint Service — API calls สำหรับระบบลายนิ้วมือ
 * ===================================================================
 */

import api from "@/lib/api";

const fingerprintService = {
  /**
   * ลงทะเบียนลายนิ้วมือ
   * @param {{ studentId: string, imageBase64: string, fingerIndex?: string, pdpaConsent: boolean }}
   */
  enroll: async (data) => {
    try {
      const response = await api.post("/fingerprint/enroll", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ระบุตัวตน + เช็คชื่ออัตโนมัติ
   * @param {{ sessionId: string, imageBase64: string }}
   */
  identifyAndCheckIn: async (data) => {
    try {
      const response = await api.post("/fingerprint/identify", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ยืนยัน 1:1
   * @param {{ studentId: string, imageBase64: string }}
   */
  verify: async (data) => {
    try {
      const response = await api.post("/fingerprint/verify", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ตรวจสอบสถานะลงทะเบียน (นักศึกษาคนเดียว)
   * @param {string} studentId
   */
  getStatus: async (studentId) => {
    try {
      const response = await api.get(`/fingerprint/status/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ตรวจสอบสถานะลงทะเบียนรายกลุ่ม
   * @param {string[]} studentIds
   */
  getBulkStatus: async (studentIds) => {
    try {
      const response = await api.post("/fingerprint/status/bulk", {
        studentIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * ลบลายนิ้วมือ (PDPA Right to Erasure)
   * @param {string} studentId
   * @param {string} [fingerIndex]
   */
  delete: async (studentId, fingerIndex) => {
    try {
      const params = fingerIndex ? { fingerIndex } : {};
      const response = await api.delete(`/fingerprint/${studentId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default fingerprintService;
