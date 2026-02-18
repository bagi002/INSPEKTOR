import { CASE_WORKSPACE_MODES, buildCaseWorkspaceRoute } from "../utils/routes";
import { formatAverageRating, formatReviews, formatStatus } from "./loggedHomeData";

function LoggedCreatedCaseDetails({ item, onOpenStatistics }) {
  const isPublishedCase = item.publicationStatus === "published";
  const actionLabel = isPublishedCase ? "Otvori statistiku" : "Nastavi kreiranje";

  return (
    <>
      <p>
        Status: <strong>{formatStatus(item.publicationStatus)}</strong> | Ocena:{" "}
        {formatAverageRating(item.rating)} ({formatReviews(item.reviews)})
      </p>
      {isPublishedCase ? (
        <button
          type="button"
          className="btn btn-secondary inline-action case-inline-link"
          onClick={() => onOpenStatistics?.(item)}
        >
          {actionLabel}
        </button>
      ) : (
        <a
          className="btn btn-secondary inline-action case-inline-link"
          href={buildCaseWorkspaceRoute(item.id, CASE_WORKSPACE_MODES.CREATE)}
        >
          {actionLabel}
        </a>
      )}
    </>
  );
}

export default LoggedCreatedCaseDetails;
