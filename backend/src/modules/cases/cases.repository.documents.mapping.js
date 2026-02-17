import {
  IMAGE_EVIDENCE_SUPPORTED_DOCUMENT_TYPES,
  sanitizeImageEvidence,
} from "./cases.documents.validation.shared.js";

const DOCUMENT_NUMBER_PREFIX = {
  police_report: "PIR",
  forensic_report: "FOR",
  witness_statement: "IZS",
  suspect_statement: "IZO",
  victim_statement: "IZZ",
  dossier: "DOS",
};

function buildDocumentNumber(documentType, caseId, documentId) {
  const prefix = DOCUMENT_NUMBER_PREFIX[documentType] || "DOC";
  const caseCode = String(caseId || 0).padStart(4, "0");
  const documentCode = String(documentId || 0).padStart(5, "0");
  return `${prefix}-${caseCode}-${documentCode}`;
}

function parseJsonObject(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeRelatedIds(rawIds) {
  if (!Array.isArray(rawIds)) {
    return [];
  }

  const uniqueIds = new Set();
  rawIds.forEach((candidate) => {
    const parsed = toPositiveInteger(candidate);
    if (parsed) {
      uniqueIds.add(parsed);
    }
  });

  return Array.from(uniqueIds);
}

function normalizeTypeSpecific(rawTypeSpecific) {
  if (!rawTypeSpecific || typeof rawTypeSpecific !== "object" || Array.isArray(rawTypeSpecific)) {
    return {};
  }

  return rawTypeSpecific;
}

function normalizeImageEvidence(documentType, rawImageEvidence) {
  if (!IMAGE_EVIDENCE_SUPPORTED_DOCUMENT_TYPES.has(documentType)) {
    return [];
  }

  const normalized = sanitizeImageEvidence(rawImageEvidence);
  return normalized || [];
}

export function mapCaseDocumentRow(row) {
  const metadata = parseJsonObject(row.metadata_json);
  const documentType = row.document_type;

  return {
    id: row.id,
    caseId: row.case_id,
    documentType,
    title: row.title,
    content: row.content,
    sequenceOrder: row.sequence_order,
    isUnlockedByDefault: row.is_unlocked_by_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: {
      documentNumber:
        typeof metadata.documentNumber === "string" && metadata.documentNumber.trim().length > 0
          ? metadata.documentNumber.trim()
          : buildDocumentNumber(documentType, row.case_id, row.id),
      classificationLevel: metadata.classificationLevel || "interno",
      recordedAt: metadata.recordedAt || "",
      location: metadata.location || "",
      officerName: metadata.officerName || "",
      badgeNumber: metadata.badgeNumber || "",
      department: metadata.department || "",
      evidenceReference: metadata.evidenceReference || "",
      legalReference: metadata.legalReference || "",
      notes: metadata.notes || "",
      giverPersonId: toPositiveInteger(metadata.giverPersonId),
      relatedPersonIds: normalizeRelatedIds(metadata.relatedPersonIds),
      typeSpecific: normalizeTypeSpecific(metadata.typeSpecific),
      imageEvidence: normalizeImageEvidence(documentType, metadata.imageEvidence),
    },
  };
}
