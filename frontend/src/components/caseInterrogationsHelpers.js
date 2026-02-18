export const EMPTY_INTERROGATION_NODE_FORM = {
  question: "",
  answer: "",
  parentKey: "",
  sourceNodeKey: "",
};

function toNumber(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function sortInterrogationNodes(nodes) {
  return (Array.isArray(nodes) ? nodes : [])
    .slice()
    .sort((left, right) => {
      const leftOrder = Number(left?.sequenceOrder) || 0;
      const rightOrder = Number(right?.sequenceOrder) || 0;
      if (leftOrder === rightOrder) {
        return String(left?.nodeKey || "").localeCompare(String(right?.nodeKey || ""));
      }
      return leftOrder - rightOrder;
    });
}

export function buildInterrogationChildrenMap(nodes) {
  const childrenByParent = new Map();
  sortInterrogationNodes(nodes).forEach((node) => {
    const parentKey = String(node?.parentKey || "");
    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey).push(node);
  });
  return childrenByParent;
}

export function buildNextNodeKey(nodes) {
  let maxIndex = 0;
  (Array.isArray(nodes) ? nodes : []).forEach((node) => {
    const rawKey = String(node?.nodeKey || "");
    const match = rawKey.match(/^q(\d+)$/i);
    if (!match) {
      return;
    }
    const parsed = toNumber(match[1]);
    if (parsed && parsed > maxIndex) {
      maxIndex = parsed;
    }
  });
  return `q${maxIndex + 1}`;
}

export function sanitizeInterrogations(items) {
  return (Array.isArray(items) ? items : []).map((interrogation) => ({
    ...interrogation,
    personId: Number(interrogation?.personId) || 0,
    person: interrogation?.person || null,
    nodes: sortInterrogationNodes(interrogation?.nodes).map((node) => ({
      ...node,
      questionReferenceKey: String(node?.questionReferenceKey || node?.nodeKey || ""),
    })),
  }));
}

export function buildInterrogationsStats(interrogations, peopleDirectory) {
  const alivePeople = (Array.isArray(peopleDirectory) ? peopleDirectory : []).filter(
    (person) => person?.isAlive !== false
  );
  const coveredPersonIds = new Set(interrogations.map((item) => item.personId).filter(Boolean));
  const withoutInterrogation = alivePeople.filter((person) => !coveredPersonIds.has(person.id)).length;

  return [
    { label: "Ukupno saslušanja", value: interrogations.length },
    { label: "Žive osobe", value: alivePeople.length },
    { label: "Bez saslušanja", value: withoutInterrogation },
  ];
}

export function findInterrogationByPerson(interrogations, personId) {
  const parsedPersonId = toNumber(personId);
  if (!parsedPersonId) {
    return null;
  }
  return interrogations.find((interrogation) => interrogation.personId === parsedPersonId) || null;
}
