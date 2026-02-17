import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCreatorCasePersonController,
  createCaseController,
  getCreatorCaseController,
  getCreatorCasePeopleController,
  getLoggedHomeOverviewController,
} from "./cases.controller.js";

const casesRoutes = Router();

casesRoutes.use(requireAuth);
casesRoutes.get("/home", asyncHandler(getLoggedHomeOverviewController));
casesRoutes.get("/:caseId/creator", asyncHandler(getCreatorCaseController));
casesRoutes.get("/:caseId/people", asyncHandler(getCreatorCasePeopleController));
casesRoutes.post("/:caseId/people", asyncHandler(createCreatorCasePersonController));
casesRoutes.post("/", asyncHandler(createCaseController));

export default casesRoutes;
