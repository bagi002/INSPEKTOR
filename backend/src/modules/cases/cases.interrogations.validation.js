import { toInteger, toText } from "./cases.documents.validation.shared.js";

const NODE_KEY_PATTERN = /^[a-zA-Z0-9_-]{1,40}$/;
const MAX_TITLE_LENGTH = 160;
const MAX_PROMPT_LENGTH = 700;
const MAX_QUESTION_LENGTH = 320;
const MAX_ANSWER_LENGTH = 4000;
const MAX_NODES = 80;

function hasCycle(nodesByKey) {
  function detect(startKey) {
    const seen = new Set();
    let cursor = startKey;
    while (cursor) {
      if (seen.has(cursor)) {
        return true;
      }
      seen.add(cursor);
      const node = nodesByKey.get(cursor);
      cursor = node?.parentKey || "";
    }
    return false;
  }

  for (const key of nodesByKey.keys()) {
    if (detect(key)) {
      return true;
    }
  }
  return false;
}

function hasBranchReferenceConflict(startNode, nodesByKey) {
  const usedReferenceKeys = new Set();
  let cursor = startNode;
  while (cursor) {
    const referenceKey = cursor.questionReferenceKey || cursor.nodeKey;
    if (usedReferenceKeys.has(referenceKey)) {
      return true;
    }
    usedReferenceKeys.add(referenceKey);
    cursor = cursor.parentKey ? nodesByKey.get(cursor.parentKey) || null : null;
  }
  return false;
}

function normalizeNodes(rawNodes, errors) {
  if (!Array.isArray(rawNodes)) {
    errors.nodes = "Stablo saslušanja mora biti lista čvorova pitanja i odgovora.";
    return [];
  }

  if (rawNodes.length === 0) {
    errors.nodes = "Saslušanje mora imati najmanje jedno pitanje.";
    return [];
  }

  if (rawNodes.length > MAX_NODES) {
    errors.nodes = `Saslušanje može imati najviše ${MAX_NODES} čvorova pitanja i odgovora.`;
    return [];
  }

  const normalized = [];
  const usedNodeKeys = new Set();

  rawNodes.forEach((rawNode, index) => {
    const prefix = `nodes[${index}]`;
    const nodeKey = toText(rawNode?.nodeKey);
    const parentKey = toText(rawNode?.parentKey);
    const rawQuestionReferenceKey = toText(rawNode?.questionReferenceKey);
    const questionReferenceKey = rawQuestionReferenceKey || nodeKey;
    const question = toText(rawNode?.question);
    const answer = toText(rawNode?.answer);
    const parsedOrder = toInteger(rawNode?.sequenceOrder);
    const sequenceOrder = parsedOrder && parsedOrder > 0 ? parsedOrder : index + 1;

    if (!NODE_KEY_PATTERN.test(nodeKey)) {
      errors[`${prefix}.nodeKey`] = "Identifikator pitanja nije validan.";
    } else if (usedNodeKeys.has(nodeKey)) {
      errors[`${prefix}.nodeKey`] = "Identifikator pitanja mora biti jedinstven.";
    } else {
      usedNodeKeys.add(nodeKey);
    }

    if (parentKey.length > 0 && !NODE_KEY_PATTERN.test(parentKey)) {
      errors[`${prefix}.parentKey`] = "Veza ka prethodnom pitanju nije validna.";
    }
    if (parentKey.length > 0 && parentKey === nodeKey) {
      errors[`${prefix}.parentKey`] = "Pitanje ne može biti samo sebi roditelj.";
    }
    if (!NODE_KEY_PATTERN.test(questionReferenceKey)) {
      errors[`${prefix}.questionReferenceKey`] = "Referenca pitanja nije validna.";
    }

    if (question.length < 3) {
      errors[`${prefix}.question`] = "Pitanje mora imati najmanje 3 karaktera.";
    } else if (question.length > MAX_QUESTION_LENGTH) {
      errors[`${prefix}.question`] = `Pitanje može imati najviše ${MAX_QUESTION_LENGTH} karaktera.`;
    }

    if (answer.length < 3) {
      errors[`${prefix}.answer`] = "Odgovor mora imati najmanje 3 karaktera.";
    } else if (answer.length > MAX_ANSWER_LENGTH) {
      errors[`${prefix}.answer`] = `Odgovor može imati najviše ${MAX_ANSWER_LENGTH} karaktera.`;
    }

    normalized.push({
      nodeKey,
      parentKey,
      questionReferenceKey,
      question,
      answer,
      sequenceOrder,
    });
  });

  const nodesByKey = new Map(normalized.map((node) => [node.nodeKey, node]));
  const rootCount = normalized.filter((node) => node.parentKey.length === 0).length;
  if (rootCount === 0) {
    errors.nodes = "Saslušanje mora imati početno pitanje (root čvor).";
  }

  normalized.forEach((node, index) => {
    if (node.parentKey && !nodesByKey.has(node.parentKey)) {
      errors[`nodes[${index}].parentKey`] = "Roditeljsko pitanje ne postoji u stablu.";
    }
    if (node.questionReferenceKey && !nodesByKey.has(node.questionReferenceKey)) {
      errors[`nodes[${index}].questionReferenceKey`] =
        "Referenca pitanja mora pokazivati na postojeći čvor pitanja u stablu.";
    }
  });

  if (Object.keys(errors).length === 0 && hasCycle(nodesByKey)) {
    errors.nodes = "Stablo pitanja ne sme sadržati ciklične veze.";
  }
  if (Object.keys(errors).length === 0) {
    normalized.forEach((node, index) => {
      if (hasBranchReferenceConflict(node, nodesByKey)) {
        errors[`nodes[${index}].questionReferenceKey`] =
          "Isto pitanje ne može biti dodato dva puta u istoj grani saslušanja.";
      }
    });
  }

  return normalized
    .slice()
    .sort((left, right) =>
      left.sequenceOrder === right.sequenceOrder
        ? left.nodeKey.localeCompare(right.nodeKey)
        : left.sequenceOrder - right.sequenceOrder
    )
    .map((node, index) => ({
      ...node,
      sequenceOrder: index + 1,
    }));
}

export function validateCreateCaseInterrogationPayload(payload) {
  const errors = {};
  const personId = toInteger(payload?.personId);
  const title = toText(payload?.title);
  const openingPrompt = toText(payload?.openingPrompt);
  const nodes = normalizeNodes(payload?.nodes, errors);

  if (!personId || personId <= 0) {
    errors.personId = "Saslušanje mora biti povezano sa validnom osobom.";
  }

  if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Naslov saslušanja može imati najviše ${MAX_TITLE_LENGTH} karaktera.`;
  }

  if (openingPrompt.length > MAX_PROMPT_LENGTH) {
    errors.openingPrompt = `Uvodna poruka može imati najviše ${MAX_PROMPT_LENGTH} karaktera.`;
  }

  return {
    errors,
    sanitized: {
      personId: personId || null,
      title: title || "Saslušanje",
      openingPrompt,
      nodes,
    },
  };
}
