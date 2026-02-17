import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCreatorCasePoliceDocumentController,
  createCreatorCasePersonController,
  createCreatorCaseStatementController,
  createCaseController,
  getCreatorCasePoliceDocumentsController,
  getCreatorCaseController,
  getCreatorCasePeopleController,
  getCreatorCaseStatementsController,
  getLoggedHomeOverviewController,
} from "./cases.controller.js";

const casesRoutes = Router();

casesRoutes.use(requireAuth);
casesRoutes.get("/home", asyncHandler(getLoggedHomeOverviewController));
casesRoutes.get("/:caseId/creator", asyncHandler(getCreatorCaseController));
casesRoutes.get("/:caseId/people", asyncHandler(getCreatorCasePeopleController));
casesRoutes.post("/:caseId/people", asyncHandler(createCreatorCasePersonController));
casesRoutes.get("/:caseId/statements", asyncHandler(getCreatorCaseStatementsController));
casesRoutes.post("/:caseId/statements", asyncHandler(createCreatorCaseStatementController));
casesRoutes.get(
  "/:caseId/police-documents",
  asyncHandler(getCreatorCasePoliceDocumentsController)
);
casesRoutes.post(
  "/:caseId/police-documents",
  asyncHandler(createCreatorCasePoliceDocumentController)
);
casesRoutes.post("/", asyncHandler(createCaseController));

export default casesRoutes;
