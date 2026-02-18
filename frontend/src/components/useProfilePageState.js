import { useCallback, useEffect, useState } from "react";
import {
  deleteMyProfile,
  fetchMyProfile,
  updateMyProfileBasic,
  updateMyProfilePassword,
} from "../services/profileApi";
import { clearSession, updateSessionUser } from "../services/sessionStorage";
import { PUBLIC_ROUTES } from "../utils/routes";
import { EMPTY_PROFILE_DATA, normalizeProfileData } from "./profileHelpers";

const BASIC_FORM_INITIAL_STATE = { firstName: "", lastName: "", email: "" };
const PASSWORD_FORM_INITIAL_STATE = { currentPassword: "", newPassword: "", confirmPassword: "" };
const DELETE_FORM_INITIAL_STATE = { password: "", confirmationText: "" };

export function useProfilePageState({ fallbackUser, onLogout }) {
  const [profileData, setProfileData] = useState(EMPTY_PROFILE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [basicForm, setBasicForm] = useState(BASIC_FORM_INITIAL_STATE);
  const [basicFormErrors, setBasicFormErrors] = useState({});
  const [basicFormMessage, setBasicFormMessage] = useState("");
  const [isSavingBasic, setIsSavingBasic] = useState(false);
  const [passwordForm, setPasswordForm] = useState(PASSWORD_FORM_INITIAL_STATE);
  const [passwordFormErrors, setPasswordFormErrors] = useState({});
  const [passwordFormMessage, setPasswordFormMessage] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [deleteForm, setDeleteForm] = useState(DELETE_FORM_INITIAL_STATE);
  const [deleteFormErrors, setDeleteFormErrors] = useState({});
  const [deleteFormMessage, setDeleteFormMessage] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    const result = await fetchMyProfile();
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }
      setErrorMessage(result.message || "Učitavanje profila nije uspelo.");
      setIsLoading(false);
      return;
    }
    const normalized = normalizeProfileData(result.data);
    setProfileData(normalized);
    setBasicForm({
      firstName: normalized.user?.firstName || "",
      lastName: normalized.user?.lastName || "",
      email: normalized.user?.email || "",
    });
    setIsLoading(false);
  }, [onLogout]);
  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function handleBasicFieldChange(event) {
    const { name, value } = event.target;
    setBasicForm((previous) => ({ ...previous, [name]: value }));
    setBasicFormErrors((previous) => ({ ...previous, [name]: "" }));
    setBasicFormMessage("");
  }
  async function handleBasicSubmit(event) {
    event.preventDefault();
    setBasicFormErrors({});
    setBasicFormMessage("");
    setIsSavingBasic(true);
    const result = await updateMyProfileBasic(basicForm);
    setIsSavingBasic(false);
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }
      const fallbackMessage = result.message || "Ažuriranje osnovnih podataka nije uspelo.";
      setBasicFormErrors(result.errors || { general: fallbackMessage });
      setBasicFormMessage(fallbackMessage);
      return;
    }
    const updatedUser = result.data?.user || null;
    if (updatedUser) {
      setProfileData((previous) => ({ ...previous, user: updatedUser }));
      updateSessionUser(updatedUser);
    }
    setBasicFormMessage(result.message || "Osnovni podaci su uspešno ažurirani.");
  }

  function handlePasswordFieldChange(event) {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
    setPasswordFormErrors((previous) => ({ ...previous, [name]: "" }));
    setPasswordFormMessage("");
  }
  async function handlePasswordSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errors.confirmPassword = "Potvrda nove lozinke mora odgovarati novoj lozinci.";
    }
    if (Object.keys(errors).length > 0) {
      setPasswordFormErrors(errors);
      return;
    }
    setPasswordFormErrors({});
    setPasswordFormMessage("");
    setIsSavingPassword(true);
    const result = await updateMyProfilePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setIsSavingPassword(false);
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }
      const fallbackMessage = result.message || "Promena lozinke nije uspela.";
      setPasswordFormErrors(result.errors || { general: fallbackMessage });
      setPasswordFormMessage(fallbackMessage);
      return;
    }
    setPasswordForm(PASSWORD_FORM_INITIAL_STATE);
    setPasswordFormMessage(result.message || "Lozinka je uspešno promenjena.");
  }

  function handleDeleteFieldChange(event) {
    const { name, value } = event.target;
    setDeleteForm((previous) => ({ ...previous, [name]: value }));
    setDeleteFormErrors((previous) => ({ ...previous, [name]: "" }));
    setDeleteFormMessage("");
  }
  async function handleDeleteSubmit(event) {
    event.preventDefault();
    const normalizedConfirmation = deleteForm.confirmationText.trim().toUpperCase();
    if (normalizedConfirmation !== "OBRISI" && normalizedConfirmation !== "OBRIŠI") {
      setDeleteFormErrors({ confirmationText: "Unesi tačan tekst potvrde: OBRIŠI." });
      return;
    }
    if (!window.confirm("Ovo će trajno obrisati nalog. Da li želiš da nastaviš?")) {
      return;
    }
    setDeleteFormErrors({});
    setDeleteFormMessage("");
    setIsDeletingAccount(true);
    const result = await deleteMyProfile({ password: deleteForm.password });
    setIsDeletingAccount(false);
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }
      const fallbackMessage = result.message || "Brisanje naloga nije uspelo.";
      setDeleteFormErrors(result.errors || { general: fallbackMessage });
      setDeleteFormMessage(fallbackMessage);
      return;
    }
    clearSession();
    window.location.href = PUBLIC_ROUTES.HOME;
  }
  return {
    profileData,
    isLoading,
    errorMessage,
    loadProfile,
    activeUser: profileData.user || fallbackUser,
    basicForm,
    basicFormErrors,
    basicFormMessage,
    isSavingBasic,
    handleBasicFieldChange,
    handleBasicSubmit,
    passwordForm,
    passwordFormErrors,
    passwordFormMessage,
    isSavingPassword,
    handlePasswordFieldChange,
    handlePasswordSubmit,
    deleteForm,
    deleteFormErrors,
    deleteFormMessage,
    isDeletingAccount,
    handleDeleteFieldChange,
    handleDeleteSubmit,
  };
}
