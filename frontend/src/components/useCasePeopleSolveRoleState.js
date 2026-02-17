import { useState } from "react";
import { updateCasePersonRole } from "../services/casePeopleApi";

export function useCasePeopleSolveRoleState({
  caseId,
  isCreateMode,
  onUnauthorized,
  onRoleUpdated,
}) {
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleUpdateError, setRoleUpdateError] = useState("");

  async function handleSolveRoleChange(personId, apparentRole) {
    if (isCreateMode || !Number.isInteger(personId) || personId <= 0) {
      return;
    }

    setIsUpdatingRole(true);
    setRoleUpdateError("");

    const result = await updateCasePersonRole(caseId, personId, {
      apparentRole,
    });

    if (!result.ok) {
      if (result.unauthorized) {
        setIsUpdatingRole(false);
        onUnauthorized();
        return;
      }

      setRoleUpdateError(result.message || "Promjena uloge nije uspela.");
      setIsUpdatingRole(false);
      return;
    }

    if (typeof onRoleUpdated === "function") {
      await onRoleUpdated(result.data || null);
    }

    setIsUpdatingRole(false);
  }

  return {
    isUpdatingRole,
    roleUpdateError,
    setRoleUpdateError,
    handleSolveRoleChange,
  };
}
