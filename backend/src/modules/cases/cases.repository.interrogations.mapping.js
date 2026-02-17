function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toNodeKey(value) {
  const normalized = toText(value);
  return normalized.length > 0 ? normalized : "";
}

export function mapCaseInterrogationRow(row) {
  return {
    id: row.id,
    caseId: row.case_id,
    personId: row.person_id,
    title: toText(row.title),
    openingPrompt: toText(row.opening_prompt),
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCaseInterrogationNodeRow(row) {
  const nodeKey = toNodeKey(row.node_key);
  const questionReferenceKey = toNodeKey(row.question_reference_key) || nodeKey;

  return {
    id: row.id,
    nodeKey,
    parentKey: toNodeKey(row.parent_node_key),
    questionReferenceKey,
    question: toText(row.question_text),
    answer: toText(row.answer_text),
    sequenceOrder: toPositiveInteger(row.sequence_order) || 1,
  };
}
