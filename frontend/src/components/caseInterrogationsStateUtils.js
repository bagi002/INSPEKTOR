export const INITIAL_INTERROGATION_FORM = {
  personId: "",
  title: "",
  openingPrompt: "",
  nodes: [],
};

export function resolveAlivePeople(peopleDirectory) {
  return (Array.isArray(peopleDirectory) ? peopleDirectory : []).filter((person) => person?.isAlive !== false);
}

export function collectDescendantKeys(nodes, nodeKey) {
  const childMap = new Map();
  nodes.forEach((node) => {
    const parentKey = String(node.parentKey || "");
    if (!childMap.has(parentKey)) {
      childMap.set(parentKey, []);
    }
    childMap.get(parentKey).push(node.nodeKey);
  });

  const keysToRemove = new Set([nodeKey]);
  const stack = [nodeKey];
  while (stack.length > 0) {
    const cursor = stack.pop();
    const children = childMap.get(cursor) || [];
    children.forEach((childKey) => {
      if (!keysToRemove.has(childKey)) {
        keysToRemove.add(childKey);
        stack.push(childKey);
      }
    });
  }
  return keysToRemove;
}

export function normalizeNodeErrors(errors) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  const nodeErrors = {};
  Object.entries(errors).forEach(([key, value]) => {
    if (key === "nodes" || key.startsWith("nodes[")) {
      nodeErrors[key] = value;
    }
  });
  return nodeErrors;
}

export function findNodeByKey(nodes, nodeKey) {
  return (Array.isArray(nodes) ? nodes : []).find((node) => node.nodeKey === nodeKey) || null;
}

export function hasQuestionReferenceInBranch(nodes, fromParentKey, questionReferenceKey) {
  if (!fromParentKey || !questionReferenceKey) {
    return false;
  }

  const nodesByKey = new Map((Array.isArray(nodes) ? nodes : []).map((node) => [node.nodeKey, node]));
  let cursorKey = fromParentKey;
  while (cursorKey) {
    const node = nodesByKey.get(cursorKey) || null;
    if (!node) {
      break;
    }
    const currentReferenceKey = String(node.questionReferenceKey || node.nodeKey || "");
    if (currentReferenceKey === questionReferenceKey) {
      return true;
    }
    cursorKey = String(node.parentKey || "");
  }
  return false;
}
