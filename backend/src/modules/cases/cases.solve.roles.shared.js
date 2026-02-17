const CASE_PERSON_ROLES = new Set(["unknown", "suspect", "victim", "witness"]);

export const CASE_PERSON_UNKNOWN_ROLE = "unknown";

export function normalizeCasePersonRole(value) {
  const normalizedRole =
    typeof value === "string" ? value.trim().toLowerCase() : CASE_PERSON_UNKNOWN_ROLE;

  return CASE_PERSON_ROLES.has(normalizedRole) ? normalizedRole : null;
}

export function mapSolvePeopleWithAssignedRoles(visiblePeople, selectedRolesByPersonId) {
  if (!Array.isArray(visiblePeople) || !(selectedRolesByPersonId instanceof Map)) {
    return [];
  }

  return visiblePeople.map((person) => ({
    ...person,
    apparentRole: selectedRolesByPersonId.get(person.id) || CASE_PERSON_UNKNOWN_ROLE,
  }));
}

export function buildCaseSolveRoleProgress(visiblePeople, selectedRolesByPersonId) {
  if (!Array.isArray(visiblePeople) || !(selectedRolesByPersonId instanceof Map)) {
    return {
      totalPeople: 0,
      assignedPeople: 0,
      correctlyAssignedPeople: 0,
      allRolesResolved: true,
    };
  }

  let assignedPeople = 0;
  let correctlyAssignedPeople = 0;

  visiblePeople.forEach((person) => {
    const selectedRole = selectedRolesByPersonId.get(person.id) || CASE_PERSON_UNKNOWN_ROLE;
    const expectedRole = normalizeCasePersonRole(person.apparentRole) || CASE_PERSON_UNKNOWN_ROLE;

    if (selectedRole !== CASE_PERSON_UNKNOWN_ROLE) {
      assignedPeople += 1;
    }

    if (selectedRole === expectedRole) {
      correctlyAssignedPeople += 1;
    }
  });

  return {
    totalPeople: visiblePeople.length,
    assignedPeople,
    correctlyAssignedPeople,
    allRolesResolved:
      visiblePeople.length === 0 || correctlyAssignedPeople === visiblePeople.length,
  };
}
