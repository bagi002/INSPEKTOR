import { resetCaseUserProgressToSolve } from "./cases.repository.progress.js";
import {
  assertTimelineWriteAccess,
  parseCaseId,
} from "./cases.timeline.service.shared.js";

export async function resetCreatorCaseProgressToSolve(caseIdInput, requesterUserId) {
  const caseId = parseCaseId(caseIdInput);
  await assertTimelineWriteAccess(caseId, requesterUserId);

  const progress = await resetCaseUserProgressToSolve(
    caseId,
    requesterUserId
  );

  return {
    caseId,
    progress,
  };
}
