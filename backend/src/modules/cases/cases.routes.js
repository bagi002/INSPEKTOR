import { Router } from "express";
import { requireAuth } from "../../middleware/authGuard.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  advanceCaseTimelineController,
  createCreatorCaseInterrogationController,
  createCreatorCasePoliceDocumentController,
  createCreatorCasePersonController,
  createCreatorCaseStatementController,
  createCaseController,
  getCreatorCaseInterrogationsController,
  getCreatorCasePoliceDocumentsController,
  getCreatorCaseController,
  getCreatorCasePeopleController,
  getCreatorCaseStatementsController,
  getCreatorCaseTimelineController,
  getLoggedHomeOverviewController,
  replaceCreatorCaseTimelineController,
} from "./cases.controller.js";
import {
  getCaseOverviewController,
  getCaseQuizController,
  submitCaseQuizController,
  upsertCreatorCaseQuizController,
} from "./cases.quiz.controller.js";
import { updateSolveCasePersonRoleController } from "./cases.people.controller.js";
import { resetCreatorCaseProgressToSolveController } from "./cases.progress.controller.js";

const casesRoutes = Router();

casesRoutes.use(requireAuth);
casesRoutes.get("/home", asyncHandler(getLoggedHomeOverviewController));
casesRoutes.get("/:caseId/overview", asyncHandler(getCaseOverviewController));
casesRoutes.get("/:caseId/creator", asyncHandler(getCreatorCaseController));
casesRoutes.get("/:caseId/timeline", asyncHandler(getCreatorCaseTimelineController));
casesRoutes.post("/:caseId/timeline/advance", asyncHandler(advanceCaseTimelineController));
casesRoutes.put("/:caseId/timeline", asyncHandler(replaceCreatorCaseTimelineController));
casesRoutes.get("/:caseId/people", asyncHandler(getCreatorCasePeopleController));
casesRoutes.put("/:caseId/people/:personId/role", asyncHandler(updateSolveCasePersonRoleController));
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
casesRoutes.get("/:caseId/interrogations", asyncHandler(getCreatorCaseInterrogationsController));
casesRoutes.post("/:caseId/interrogations", asyncHandler(createCreatorCaseInterrogationController));
casesRoutes.get("/:caseId/quiz", asyncHandler(getCaseQuizController));
casesRoutes.put("/:caseId/quiz", asyncHandler(upsertCreatorCaseQuizController));
casesRoutes.post("/:caseId/quiz/submit", asyncHandler(submitCaseQuizController));
casesRoutes.post(
  "/:caseId/progress/reset-to-solve",
  asyncHandler(resetCreatorCaseProgressToSolveController)
);
casesRoutes.post("/", asyncHandler(createCaseController));

export default casesRoutes;
