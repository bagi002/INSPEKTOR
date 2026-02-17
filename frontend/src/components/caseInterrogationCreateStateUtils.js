import {
  EMPTY_INTERROGATION_NODE_FORM,
  buildNextNodeKey,
} from "./caseInterrogationsHelpers";
import {
  collectDescendantKeys,
  findNodeByKey,
  hasQuestionReferenceInBranch,
} from "./caseInterrogationsStateUtils";

function resolveQuestionReferenceKey(node) {
  return String(node?.questionReferenceKey || node?.nodeKey || "");
}

export function buildNodeFromDraft(nodes, nodeDraft) {
  let question = String(nodeDraft?.question || "").trim();
  let answer = String(nodeDraft?.answer || "").trim();
  const parentKey = String(nodeDraft?.parentKey || "").trim();
  const sourceNodeKey = String(nodeDraft?.sourceNodeKey || "").trim();
  const sourceNode = sourceNodeKey ? findNodeByKey(nodes, sourceNodeKey) : null;
  let questionReferenceKey = "";

  if (parentKey && !nodes.some((node) => node.nodeKey === parentKey)) {
    return {
      error: "Izabrano nadredjeno pitanje ne postoji.",
      node: null,
      nextNodeDraft: null,
    };
  }
  if (sourceNodeKey && !sourceNode) {
    return {
      error: "Izabrano pitanje za ponavljanje ne postoji.",
      node: null,
      nextNodeDraft: null,
    };
  }

  if (sourceNode) {
    question = String(sourceNode.question || "").trim();
    answer = String(sourceNode.answer || "").trim();
    questionReferenceKey = resolveQuestionReferenceKey(sourceNode);
    if (hasQuestionReferenceInBranch(nodes, parentKey, questionReferenceKey)) {
      return {
        error: "Isto pitanje ne moze biti dodato dva puta u istoj grani.",
        node: null,
        nextNodeDraft: null,
      };
    }
  } else {
    if (question.length < 3) {
      return {
        error: "Pitanje mora imati najmanje 3 karaktera.",
        node: null,
        nextNodeDraft: null,
      };
    }
    if (answer.length < 3) {
      return {
        error: "Odgovor mora imati najmanje 3 karaktera.",
        node: null,
        nextNodeDraft: null,
      };
    }
  }

  const nodeKey = buildNextNodeKey(nodes);
  if (!questionReferenceKey) {
    questionReferenceKey = nodeKey;
  }

  return {
    error: "",
    node: {
      nodeKey,
      parentKey,
      questionReferenceKey,
      question,
      answer,
      sequenceOrder: nodes.length + 1,
    },
    nextNodeDraft: {
      ...EMPTY_INTERROGATION_NODE_FORM,
      parentKey,
    },
  };
}

export function collectInterrogationNodesForRemoval(nodes, rootNodeKey) {
  const keysToRemove = collectDescendantKeys(nodes, rootNodeKey);
  let hasChanges = true;

  while (hasChanges) {
    hasChanges = false;
    (Array.isArray(nodes) ? nodes : []).forEach((node) => {
      const nodeKey = String(node?.nodeKey || "");
      const parentKey = String(node?.parentKey || "");
      const referenceKey = resolveQuestionReferenceKey(node);
      const reusesRemovedQuestion =
        referenceKey.length > 0 && referenceKey !== nodeKey && keysToRemove.has(referenceKey);
      const hasRemovedParent = parentKey.length > 0 && keysToRemove.has(parentKey);

      if ((reusesRemovedQuestion || hasRemovedParent) && !keysToRemove.has(nodeKey)) {
        keysToRemove.add(nodeKey);
        hasChanges = true;
      }
    });
  }

  return keysToRemove;
}

export function validateInterrogationFormBeforeSubmit(formData) {
  const errors = {};
  if (!formData.personId) {
    errors.personId = "Izaberi osobu za koju kreiras saslusanje.";
  }
  if (!Array.isArray(formData.nodes) || formData.nodes.length === 0) {
    errors.nodes = "Dodaj bar jedno pitanje u stablo.";
  }
  return errors;
}

