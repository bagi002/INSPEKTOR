import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { loginController, registerController } from "./auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", asyncHandler(registerController));
authRoutes.post("/login", asyncHandler(loginController));

export default authRoutes;
