import { Router } from "express";
import { requireAdminPanelAuth } from "../../middleware/adminPanelAuthGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  adminCasesController,
  adminLoginController,
  adminOverviewController,
  adminTicketsController,
  adminUpdateCaseController,
  adminUpdateTicketStatusController,
  adminUpdateUserController,
  adminUsersController,
} from "./admin.controller.js";

const adminRoutes = Router();

adminRoutes.post("/login", asyncHandler(adminLoginController));

adminRoutes.use(requireAdminPanelAuth);
adminRoutes.get("/overview", asyncHandler(adminOverviewController));
adminRoutes.get("/tickets", asyncHandler(adminTicketsController));
adminRoutes.patch("/tickets/:ticketId/status", asyncHandler(adminUpdateTicketStatusController));
adminRoutes.get("/users", asyncHandler(adminUsersController));
adminRoutes.patch("/users/:userId", asyncHandler(adminUpdateUserController));
adminRoutes.get("/cases", asyncHandler(adminCasesController));
adminRoutes.patch("/cases/:caseId", asyncHandler(adminUpdateCaseController));

export default adminRoutes;
