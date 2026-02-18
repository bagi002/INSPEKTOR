import {
  createCase,
  getCreatorCase,
  getLoggedHomeOverview,
} from "./cases.service.js";
import { publishCreatorCase } from "./cases.publish.service.js";
import {
  createCreatorCasePoliceDocument,
  createCreatorCaseStatement,
  getCreatorCasePoliceDocuments,
  getCreatorCaseStatements,
} from "./cases.documents.service.js";
import { createCreatorCasePerson, getCreatorCasePeople } from "./cases.people.service.js";
import {
  createCreatorCaseInterrogation,
  getCreatorCaseInterrogations,
} from "./cases.interrogations.service.js";
import {
  advanceCaseTimeline,
  getCreatorCaseTimeline,
  replaceCreatorCaseTimeline,
} from "./cases.timeline.service.js";

function parseReadScope(queryValue) {
  return typeof queryValue === "string" ? queryValue : "";
}

export async function createCaseController(req, res) {
  const result = await createCase(req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Slučaj je uspešno sačuvan.",
    data: result,
  });
}

export async function getLoggedHomeOverviewController(req, res) {
  const result = await getLoggedHomeOverview(req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Podaci za ulogovanu početnu su uspešno učitani.",
    data: result,
  });
}

export async function getCreatorCaseController(req, res) {
  const result = await getCreatorCase(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Slučaj za creatorski mod je uspešno učitan.",
    data: result,
  });
}

export async function publishCreatorCaseController(req, res) {
  const result = await publishCreatorCase(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: result.alreadyPublished
      ? "Slučaj je već objavljen."
      : "Slučaj je uspešno objavljen.",
    data: result,
  });
}

export async function getCreatorCasePeopleController(req, res) {
  const result = await getCreatorCasePeople(
    req.params.caseId,
    req.auth.userId,
    parseReadScope(req.query?.scope)
  );

  res.status(200).json({
    ok: true,
    message: "Osobe i dosijei su uspešno učitani.",
    data: result,
  });
}

export async function createCreatorCasePersonController(req, res) {
  const result = await createCreatorCasePerson(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Osoba i dosije su uspešno sačuvani.",
    data: result,
  });
}

export async function getCreatorCaseStatementsController(req, res) {
  const result = await getCreatorCaseStatements(
    req.params.caseId,
    req.auth.userId,
    parseReadScope(req.query?.scope)
  );

  res.status(200).json({
    ok: true,
    message: "Izjave su uspešno učitane.",
    data: result,
  });
}

export async function createCreatorCaseStatementController(req, res) {
  const result = await createCreatorCaseStatement(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Izjava je uspešno sačuvana.",
    data: result,
  });
}

export async function getCreatorCasePoliceDocumentsController(req, res) {
  const result = await getCreatorCasePoliceDocuments(
    req.params.caseId,
    req.auth.userId,
    parseReadScope(req.query?.scope)
  );

  res.status(200).json({
    ok: true,
    message: "Policijski dokumenti su uspešno učitani.",
    data: result,
  });
}

export async function createCreatorCasePoliceDocumentController(req, res) {
  const result = await createCreatorCasePoliceDocument(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Policijski dokument je uspešno sačuvan.",
    data: result,
  });
}

export async function getCreatorCaseInterrogationsController(req, res) {
  const result = await getCreatorCaseInterrogations(
    req.params.caseId,
    req.auth.userId,
    parseReadScope(req.query?.scope)
  );

  res.status(200).json({
    ok: true,
    message: "Saslušanja su uspešno učitana.",
    data: result,
  });
}

export async function createCreatorCaseInterrogationController(req, res) {
  const result = await createCreatorCaseInterrogation(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Saslušanje je uspešno sačuvano.",
    data: result,
  });
}

export async function getCreatorCaseTimelineController(req, res) {
  const result = await getCreatorCaseTimeline(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Vremenska linija je uspešno učitana.",
    data: result,
  });
}

export async function replaceCreatorCaseTimelineController(req, res) {
  const result = await replaceCreatorCaseTimeline(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Vremenska linija je uspešno sačuvana.",
    data: result,
  });
}

export async function advanceCaseTimelineController(req, res) {
  const result = await advanceCaseTimeline(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: result.hasNewUnlock
      ? "Sledeca timeline stavka je uspešno otključana."
      : "Sve timeline stavke su već otključane.",
    data: result,
  });
}
