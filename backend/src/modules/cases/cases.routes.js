import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCaseController,
  getLoggedHomeOverviewController,
} from "./cases.controller.js";

const casesRoutes = Router();

casesRoutes.use(requireAuth);
casesRoutes.get("/home", asyncHandler(getLoggedHomeOverviewController));
casesRoutes.post("/", asyncHandler(createCaseController));

export default casesRoutes;
