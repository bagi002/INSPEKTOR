import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCaseController,
  getCreatorCaseController,
  getLoggedHomeOverviewController,
} from "./cases.controller.js";

const casesRoutes = Router();

casesRoutes.use(requireAuth);
casesRoutes.get("/home", asyncHandler(getLoggedHomeOverviewController));
casesRoutes.get("/:caseId/creator", asyncHandler(getCreatorCaseController));
casesRoutes.post("/", asyncHandler(createCaseController));

export default casesRoutes;
