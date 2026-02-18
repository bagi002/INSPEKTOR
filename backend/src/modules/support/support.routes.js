import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createSupportTicketController,
  getSupportTicketDefaultsController,
  getMySupportTicketsController,
} from "./support.controller.js";

const supportRoutes = Router();

supportRoutes.use(requireAuth);
supportRoutes.get("/ticket-defaults", asyncHandler(getSupportTicketDefaultsController));
supportRoutes.get("/tickets/me", asyncHandler(getMySupportTicketsController));
supportRoutes.post("/tickets", asyncHandler(createSupportTicketController));

export default supportRoutes;
