import { HttpError } from "../../utils/httpError.js";
import {
  createAdminAnnouncement,
  getAdminAnnouncements,
} from "./admin.repository.js";
import { validateCreateAdminAnnouncementPayload } from "./admin.announcements.validation.js";

function throwValidationIfNeeded(errors, message = "Podaci nisu validni.") {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, message, errors);
  }
}

export async function listAdminAnnouncements() {
  const announcements = await getAdminAnnouncements();
  return {
    announcements,
  };
}

export async function createAdminAnnouncementMessage(payload, adminAccountId) {
  const { errors, sanitized } = validateCreateAdminAnnouncementPayload(payload);
  throwValidationIfNeeded(errors, "Podaci za admin obavještenje nisu validni.");

  const announcement = await createAdminAnnouncement({
    title: sanitized.title,
    content: sanitized.content,
    createdByAdminAccountId: adminAccountId,
  });

  return {
    announcement,
  };
}
