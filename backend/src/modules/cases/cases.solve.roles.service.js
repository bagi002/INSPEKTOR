import { getCasePeopleByCaseId } from "./cases.repository.people.js";
import { getCasePersonRoleSelectionsByPersonIds } from "./cases.repository.people.roles.js";
import { filterPeopleByUnlockedIds } from "./cases.solve.visibility.filters.js";
import {
  buildCaseSolveRoleProgress,
  mapSolvePeopleWithAssignedRoles,
} from "./cases.solve.roles.shared.js";

export async function getSolvePeopleRoleState(caseId, userId, unlockedPersonIds) {
  const people = await getCasePeopleByCaseId(caseId);
  const visiblePeople = filterPeopleByUnlockedIds(people, unlockedPersonIds);
  const selectedRolesByPersonId = await getCasePersonRoleSelectionsByPersonIds(
    caseId,
    userId,
    visiblePeople.map((person) => person.id)
  );

  return {
    visiblePeople,
    selectedRolesByPersonId,
    solvePeople: mapSolvePeopleWithAssignedRoles(visiblePeople, selectedRolesByPersonId),
    roleProgress: buildCaseSolveRoleProgress(visiblePeople, selectedRolesByPersonId),
  };
}
