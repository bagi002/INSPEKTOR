import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  dismissPendingAnnouncementController,
  getPendingAnnouncementsController,
} from "./announcements.controller.js";

const announcementsRoutes = Router();

announcementsRoutes.use(requireAuth);
announcementsRoutes.get("/pending", asyncHandler(getPendingAnnouncementsController));
announcementsRoutes.post(
  "/:announcementId/dismiss",
  asyncHandler(dismissPendingAnnouncementController)
);

export default announcementsRoutes;
