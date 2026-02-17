import { createCase, getCreatorCase, getLoggedHomeOverview } from "./cases.service.js";
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

export async function createCaseController(req, res) {
  const result = await createCase(req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Slucaj je uspesno sacuvan.",
    data: result,
  });
}

export async function getLoggedHomeOverviewController(req, res) {
  const result = await getLoggedHomeOverview(req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Podaci za ulogovanu pocetnu su uspesno ucitani.",
    data: result,
  });
}

export async function getCreatorCaseController(req, res) {
  const result = await getCreatorCase(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Slucaj za creatorski mod je uspesno ucitan.",
    data: result,
  });
}

export async function getCreatorCasePeopleController(req, res) {
  const result = await getCreatorCasePeople(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Osobe i dosijei su uspesno ucitani.",
    data: result,
  });
}

export async function createCreatorCasePersonController(req, res) {
  const result = await createCreatorCasePerson(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Osoba i dosije su uspesno sacuvani.",
    data: result,
  });
}

export async function getCreatorCaseStatementsController(req, res) {
  const result = await getCreatorCaseStatements(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Izjave su uspesno ucitane.",
    data: result,
  });
}

export async function createCreatorCaseStatementController(req, res) {
  const result = await createCreatorCaseStatement(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Izjava je uspesno sacuvana.",
    data: result,
  });
}

export async function getCreatorCasePoliceDocumentsController(req, res) {
  const result = await getCreatorCasePoliceDocuments(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Policijski dokumenti su uspesno ucitani.",
    data: result,
  });
}

export async function createCreatorCasePoliceDocumentController(req, res) {
  const result = await createCreatorCasePoliceDocument(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Policijski dokument je uspesno sacuvan.",
    data: result,
  });
}

export async function getCreatorCaseInterrogationsController(req, res) {
  const result = await getCreatorCaseInterrogations(req.params.caseId, req.auth.userId);

  res.status(200).json({
    ok: true,
    message: "Saslusanja su uspesno ucitana.",
    data: result,
  });
}

export async function createCreatorCaseInterrogationController(req, res) {
  const result = await createCreatorCaseInterrogation(req.params.caseId, req.body || {}, req.auth.userId);

  res.status(201).json({
    ok: true,
    message: "Saslusanje je uspesno sacuvano.",
    data: result,
  });
}
