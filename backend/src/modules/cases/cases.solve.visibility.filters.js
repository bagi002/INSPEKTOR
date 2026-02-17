function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function filterPeopleByUnlockedIds(people, unlockedPersonIds) {
  if (!Array.isArray(people) || !(unlockedPersonIds instanceof Set)) {
    return [];
  }

  return people.filter((person) => unlockedPersonIds.has(person.id));
}

export function filterDocumentsByUnlockedIds(
  documents,
  unlockedDocumentIds,
  unlockedPersonIds
) {
  if (
    !Array.isArray(documents) ||
    !(unlockedDocumentIds instanceof Set) ||
    !(unlockedPersonIds instanceof Set)
  ) {
    return [];
  }

  return documents
    .filter((document) => unlockedDocumentIds.has(document.id))
    .map((document) => {
      const relatedPeople = Array.isArray(document?.relatedPeople)
        ? document.relatedPeople.filter((person) => unlockedPersonIds.has(person.id))
        : [];
      const giverPersonId = toPositiveInteger(document?.giverPerson?.id);
      const giverPerson =
        giverPersonId && unlockedPersonIds.has(giverPersonId)
          ? document.giverPerson
          : null;

      return {
        ...document,
        relatedPeople,
        giverPerson,
      };
    });
}

export function filterInterrogationsByUnlockedPeople(interrogations, unlockedPersonIds) {
  if (!Array.isArray(interrogations) || !(unlockedPersonIds instanceof Set)) {
    return [];
  }

  return interrogations.filter((interrogation) =>
    unlockedPersonIds.has(interrogation?.person?.id || interrogation?.personId)
  );
}
