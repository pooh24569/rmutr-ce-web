/**
 * parentAccountService.js
 *
 * With the new parent login system (login by guardian name + student ID),
 * we no longer create separate User accounts for parents.
 * This service now only checks if guardian info is complete.
 */

import StudentProfile from "../models/studentProfileModel.js";
import { logger } from "../utils/logger.js";

const isGuardianInfoComplete = (guardian) =>
  guardian &&
  guardian.firstName?.trim() &&
  guardian.lastName?.trim();

/**
 * Called after a student profile is saved.
 * Returns info about guardian status for toast messages on the frontend.
 */
export const createParentAccountsForStudent = async (userId) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId });
    if (!studentProfile) return [];

    const guardian = studentProfile.guardian;
    if (!isGuardianInfoComplete(guardian)) {
      logger.info("Guardian info incomplete — parent login not available yet", { userId });
      return [];
    }

    const guardianName = `${guardian.firstName.trim()} ${guardian.lastName.trim()}`;
    logger.info("Guardian info saved — parent can now login", { userId, guardianName });

    return [{
      type: "guardian",
      name: guardianName,
      isNew: true,
      loginReady: true,
    }];
  } catch (err) {
    logger.error("Error checking guardian info", { userId, error: err.message });
    return [];
  }
};

export default { createParentAccountsForStudent };
