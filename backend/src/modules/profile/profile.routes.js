import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  deleteMyProfileController,
  getMyProfileController,
  updateMyProfileBasicController,
  updateMyProfilePasswordController,
} from "./profile.controller.js";

const profileRoutes = Router();

profileRoutes.use(requireAuth);
profileRoutes.get("/", asyncHandler(getMyProfileController));
profileRoutes.put("/basic", asyncHandler(updateMyProfileBasicController));
profileRoutes.put("/password", asyncHandler(updateMyProfilePasswordController));
profileRoutes.delete("/", asyncHandler(deleteMyProfileController));

export default profileRoutes;
