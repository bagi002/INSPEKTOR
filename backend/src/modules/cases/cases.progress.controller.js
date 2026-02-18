import { resetCreatorCaseProgressToSolve } from "./cases.progress.service.js";

export async function resetCreatorCaseProgressToSolveController(req, res) {
  const result = await resetCreatorCaseProgressToSolve(
    req.params.caseId,
    req.auth.userId
  );

  res.status(200).json({
    ok: true,
    message: "Status slučaja je vraćen na režim rešavanja.",
    data: result,
  });
}
