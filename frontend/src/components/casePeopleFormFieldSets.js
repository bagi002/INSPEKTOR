import {
  CASE_PERSON_EDUCATION_OPTIONS,
  CASE_PERSON_EYE_COLOR_OPTIONS,
  CASE_PERSON_GENDER_OPTIONS,
  CASE_PERSON_HAIR_COLOR_OPTIONS,
  CASE_PERSON_LIFE_STATUS_OPTIONS,
  CASE_PERSON_MARITAL_STATUS_OPTIONS,
  CASE_PERSON_NATIONALITY_OPTIONS,
} from "./casePeopleOptions";

export const CASE_PEOPLE_TEXT_FIELDS = [
  { id: "case-person-phone", name: "phoneNumber", label: "Telefon" },
  { id: "case-person-address", name: "address", label: "Adresa" },
  { id: "case-person-birth-place", name: "birthPlace", label: "Mjesto rodjenja" },
  { id: "case-person-occupation", name: "occupation", label: "Zanimanje" },
  { id: "case-person-employer", name: "employer", label: "Poslodavac" },
  { id: "case-person-last-location", name: "lastKnownLocation", label: "Posljednja lokacija" },
];

export const CASE_PEOPLE_SELECT_FIELDS = [
  {
    id: "case-person-nationality",
    name: "nationality",
    label: "Nacionalnost",
    options: CASE_PERSON_NATIONALITY_OPTIONS,
  },
  {
    id: "case-person-gender",
    name: "gender",
    label: "Pol",
    options: CASE_PERSON_GENDER_OPTIONS,
  },
  {
    id: "case-person-marital-status",
    name: "maritalStatus",
    label: "Bracni status",
    options: CASE_PERSON_MARITAL_STATUS_OPTIONS,
  },
  {
    id: "case-person-education",
    name: "educationLevel",
    label: "Obrazovanje",
    options: CASE_PERSON_EDUCATION_OPTIONS,
  },
  {
    id: "case-person-eye-color",
    name: "eyeColor",
    label: "Boja ociju",
    options: CASE_PERSON_EYE_COLOR_OPTIONS,
  },
  {
    id: "case-person-hair-color",
    name: "hairColor",
    label: "Boja kose",
    options: CASE_PERSON_HAIR_COLOR_OPTIONS,
  },
  {
    id: "case-person-life-status",
    name: "isAlive",
    label: "Status osobe",
    options: CASE_PERSON_LIFE_STATUS_OPTIONS,
  },
];
