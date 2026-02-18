import {
  dismissPendingAnnouncement,
  getPendingAnnouncements,
} from "./announcements.service.js";

export async function getPendingAnnouncementsController(req, res) {
  const result = await getPendingAnnouncements(req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Pending obavjestenja su uspesno ucitana.",
    data: result,
  });
}

export async function dismissPendingAnnouncementController(req, res) {
  const result = await dismissPendingAnnouncement(
    req.params.announcementId,
    req.auth.userId
  );

  res.status(200).json({
    ok: true,
    message: "Obavjestenje je zatvoreno.",
    data: result,
  });
}
