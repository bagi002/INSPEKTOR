import { Router } from "express";
import { requireAdminPanelAuth } from "../../middleware/adminPanelAuthGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  adminAnnouncementsController,
  adminCasesController,
  adminCreateAnnouncementController,
  adminDeleteUserController,
  adminLoginController,
  adminOverviewController,
  adminSettingsController,
  adminTicketsController,
  adminUpdateActiveAppVersionController,
  adminUpdateCaseController,
  adminUpdateTicketStatusController,
  adminUpdateUserController,
  adminUsersController,
} from "./admin.controller.js";

const adminRoutes = Router();

adminRoutes.post("/login", asyncHandler(adminLoginController));

adminRoutes.use(requireAdminPanelAuth);
adminRoutes.get("/overview", asyncHandler(adminOverviewController));
adminRoutes.get("/settings", asyncHandler(adminSettingsController));
adminRoutes.get("/tickets", asyncHandler(adminTicketsController));
adminRoutes.patch("/tickets/:ticketId/status", asyncHandler(adminUpdateTicketStatusController));
adminRoutes.patch(
  "/settings/active-app-version",
  asyncHandler(adminUpdateActiveAppVersionController)
);
adminRoutes.get("/announcements", asyncHandler(adminAnnouncementsController));
adminRoutes.post("/announcements", asyncHandler(adminCreateAnnouncementController));
adminRoutes.get("/users", asyncHandler(adminUsersController));
adminRoutes.patch("/users/:userId", asyncHandler(adminUpdateUserController));
adminRoutes.delete("/users/:userId", asyncHandler(adminDeleteUserController));
adminRoutes.get("/cases", asyncHandler(adminCasesController));
adminRoutes.patch("/cases/:caseId", asyncHandler(adminUpdateCaseController));

export default adminRoutes;
