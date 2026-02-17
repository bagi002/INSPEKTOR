import {
  FORENSIC_TRACE_TYPES,
  INCIDENT_CATEGORIES,
  SUSPECT_STATEMENT_STANCES,
  THREAT_PERCEPTION_LEVELS,
  VICTIM_INJURY_LEVELS,
  WITNESS_RELIABILITY_LEVELS,
  sanitizeKnownValue,
  toBoolean,
  toInteger,
  toText,
} from "./cases.documents.validation.shared.js";

function toObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function validateWitnessStatement(typeSpecific, errors) {
  const witnessPosition = toText(typeSpecific.witnessPosition);
  const reliabilityAssessment = sanitizeKnownValue(
    typeSpecific.reliabilityAssessment,
    WITNESS_RELIABILITY_LEVELS
  );

  const rawDistance = typeSpecific.observationDistanceMeters;
  const hasDistance = rawDistance !== undefined && rawDistance !== null && String(rawDistance).trim().length > 0;
  const observationDistanceMeters = hasDistance ? toInteger(rawDistance) : null;

  if (witnessPosition.length < 2) {
    errors["typeSpecific.witnessPosition"] = "Polozaj svjedoka je obavezno polje (min 2 znaka).";
  }
  if (!reliabilityAssessment) {
    errors["typeSpecific.reliabilityAssessment"] = "Procjena pouzdanosti izjave nije validna.";
  }
  if (hasDistance && observationDistanceMeters === null) {
    errors["typeSpecific.observationDistanceMeters"] = "Udaljenost mora biti ceo broj.";
  }
  if (observationDistanceMeters !== null && (observationDistanceMeters < 0 || observationDistanceMeters > 5000)) {
    errors["typeSpecific.observationDistanceMeters"] = "Udaljenost mora biti broj izmedju 0 i 5000.";
  }

  return {
    witnessPosition,
    observationDistanceMeters,
    reliabilityAssessment: reliabilityAssessment || "",
  };
}

function validateSuspectStatement(typeSpecific, errors) {
  const statementStance = sanitizeKnownValue(typeSpecific.statementStance, SUSPECT_STATEMENT_STANCES);
  const alibiDescription = toText(typeSpecific.alibiDescription);
  const rightsRead = toBoolean(typeSpecific.rightsRead);
  const lawyerPresent = toBoolean(typeSpecific.lawyerPresent);

  if (!statementStance) {
    errors["typeSpecific.statementStance"] = "Stav osumnjicenog nije validan.";
  }
  if (alibiDescription.length > 3000) {
    errors["typeSpecific.alibiDescription"] = "Opis alibija moze imati najvise 3000 karaktera.";
  }

  return {
    rightsRead,
    lawyerPresent,
    statementStance: statementStance || "",
    alibiDescription,
  };
}

function validateVictimStatement(typeSpecific, errors) {
  const injuryLevel = sanitizeKnownValue(typeSpecific.injuryLevel, VICTIM_INJURY_LEVELS);
  const threatPerception = sanitizeKnownValue(typeSpecific.threatPerception, THREAT_PERCEPTION_LEVELS);
  const medicalAidProvided = toBoolean(typeSpecific.medicalAidProvided);
  const lossDescription = toText(typeSpecific.lossDescription);

  if (!injuryLevel) {
    errors["typeSpecific.injuryLevel"] = "Stepen povreda nije validan.";
  }
  if (!threatPerception) {
    errors["typeSpecific.threatPerception"] = "Procjena prijetnje nije validna.";
  }
  if (lossDescription.length > 3000) {
    errors["typeSpecific.lossDescription"] = "Opis stete moze imati najvise 3000 karaktera.";
  }

  return {
    injuryLevel: injuryLevel || "",
    medicalAidProvided,
    threatPerception: threatPerception || "",
    lossDescription,
  };
}

function validatePoliceReport(typeSpecific, errors) {
  const incidentCategory = sanitizeKnownValue(typeSpecific.incidentCategory, INCIDENT_CATEGORIES);
  const operationCode = toText(typeSpecific.operationCode);
  const respondingUnit = toText(typeSpecific.respondingUnit);
  const immediateMeasures = toText(typeSpecific.immediateMeasures);

  if (!incidentCategory) {
    errors["typeSpecific.incidentCategory"] = "Kategorija incidenta nije validna.";
  }
  if (operationCode.length > 80) {
    errors["typeSpecific.operationCode"] = "Operativni kod moze imati najvise 80 karaktera.";
  }
  if (respondingUnit.length > 120) {
    errors["typeSpecific.respondingUnit"] = "Interventna jedinica moze imati najvise 120 karaktera.";
  }
  if (immediateMeasures.length > 3000) {
    errors["typeSpecific.immediateMeasures"] = "Mjere mogu imati najvise 3000 karaktera.";
  }

  return {
    incidentCategory: incidentCategory || "",
    operationCode,
    respondingUnit,
    immediateMeasures,
  };
}

function validateForensicReport(typeSpecific, errors) {
  const laboratoryName = toText(typeSpecific.laboratoryName);
  const analysisMethod = toText(typeSpecific.analysisMethod);
  const traceType = sanitizeKnownValue(typeSpecific.traceType, FORENSIC_TRACE_TYPES);
  const conclusionSummary = toText(typeSpecific.conclusionSummary);

  const rawSampleCount = typeSpecific.sampleCount;
  const hasSampleCount = rawSampleCount !== undefined && rawSampleCount !== null && String(rawSampleCount).trim().length > 0;
  const sampleCount = hasSampleCount ? toInteger(rawSampleCount) : null;

  if (laboratoryName.length < 2) {
    errors["typeSpecific.laboratoryName"] = "Naziv laboratorije je obavezan (min 2 znaka).";
  }
  if (analysisMethod.length < 2) {
    errors["typeSpecific.analysisMethod"] = "Metoda analize je obavezna (min 2 znaka).";
  }
  if (!traceType) {
    errors["typeSpecific.traceType"] = "Tip traga nije validan.";
  }
  if (conclusionSummary.length < 10) {
    errors["typeSpecific.conclusionSummary"] = "Zakljucak vjestacenja mora imati najmanje 10 karaktera.";
  }
  if (hasSampleCount && sampleCount === null) {
    errors["typeSpecific.sampleCount"] = "Broj uzoraka mora biti ceo broj.";
  }
  if (sampleCount !== null && (sampleCount < 0 || sampleCount > 2000)) {
    errors["typeSpecific.sampleCount"] = "Broj uzoraka mora biti izmedju 0 i 2000.";
  }

  return {
    laboratoryName,
    analysisMethod,
    sampleCount,
    traceType: traceType || "",
    conclusionSummary,
  };
}

export function validateTypeSpecificMetadata(documentType, rawTypeSpecific, errors) {
  const typeSpecific = toObject(rawTypeSpecific);

  if (documentType === "witness_statement") {
    return validateWitnessStatement(typeSpecific, errors);
  }
  if (documentType === "suspect_statement") {
    return validateSuspectStatement(typeSpecific, errors);
  }
  if (documentType === "victim_statement") {
    return validateVictimStatement(typeSpecific, errors);
  }
  if (documentType === "police_report") {
    return validatePoliceReport(typeSpecific, errors);
  }
  if (documentType === "forensic_report") {
    return validateForensicReport(typeSpecific, errors);
  }

  return {};
}
