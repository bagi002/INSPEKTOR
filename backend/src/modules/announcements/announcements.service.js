import {
  dismissAdminAnnouncementForUser,
  findPendingAdminAnnouncementForUserById,
  getPendingAdminAnnouncementsForUser,
} from "../admin/admin.repository.js";
import { HttpError } from "../../utils/httpError.js";

function parsePositiveId(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function getPendingAnnouncements(userId) {
  const announcements = await getPendingAdminAnnouncementsForUser(userId);
  return {
    announcements,
  };
}

export async function dismissPendingAnnouncement(announcementId, userId) {
  const parsedAnnouncementId = parsePositiveId(announcementId);
  if (!parsedAnnouncementId) {
    throw new HttpError(400, "Identifikator obavjestenja nije validan.");
  }

  const pendingAnnouncement = await findPendingAdminAnnouncementForUserById(
    parsedAnnouncementId,
    userId
  );
  if (!pendingAnnouncement) {
    throw new HttpError(404, "Obavjestenje nije dostupno za ovog korisnika.");
  }

  await dismissAdminAnnouncementForUser(parsedAnnouncementId, userId);
  return {
    dismissedAnnouncementId: parsedAnnouncementId,
  };
}
