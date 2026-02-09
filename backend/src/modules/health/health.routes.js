import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { healthController } from "./health.controller.js";

const healthRoutes = Router();

healthRoutes.get("/", asyncHandler(healthController));

export default healthRoutes;
