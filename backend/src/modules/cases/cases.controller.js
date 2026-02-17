import { createCase, getCreatorCase, getLoggedHomeOverview } from "./cases.service.js";
import { createCreatorCasePerson, getCreatorCasePeople } from "./cases.people.service.js";

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
