import { AUTH_ROUTES } from "../utils/routes";
import LoggedSidebar from "./LoggedSidebar";
import ProfileActivityPanel from "./ProfileActivityPanel";
import ProfileBasicForm from "./ProfileBasicForm";
import ProfileDeleteAccountForm from "./ProfileDeleteAccountForm";
import ProfilePasswordForm from "./ProfilePasswordForm";
import ProfileThemeForm from "./ProfileThemeForm";
import { formatProfileDate } from "./profileHelpers";
import { useProfilePageState } from "./useProfilePageState";

function ProfilePage({ user, onLogout, themePreference, onThemePreferenceChange }) {
  const {
    profileData,
    isLoading,
    errorMessage,
    loadProfile,
    activeUser,
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
  } = useProfilePageState({ fallbackUser: user, onLogout });

  return (
    <div className="app-shell app-shell-logged">
      <LoggedSidebar activePath={AUTH_ROUTES.PROFILE} user={activeUser} onLogout={onLogout} />
      <main className="content logged-content">
        <section className="card profile-hero reveal delay-1">
          <p className="eyebrow">Korisnicki profil</p>
          <h2>{activeUser?.firstName} {activeUser?.lastName}</h2>
          <p>Email: <strong>{activeUser?.email || "-"}</strong></p>
          <p>Datum registracije: <strong>{formatProfileDate(activeUser?.createdAt)}</strong></p>
        </section>

        {isLoading ? <section className="card reveal delay-2"><p>Učitavanje profila...</p></section> : null}
        {!isLoading && errorMessage ? (
          <section className="card reveal delay-2">
            <p className="error-banner">{errorMessage}</p>
            <button className="btn btn-primary inline-action" type="button" onClick={loadProfile}>
              Pokušaj ponovo
            </button>
          </section>
        ) : null}
        {!isLoading && !errorMessage ? (
          <>
            <ProfileActivityPanel activity={profileData.activity} />
            <section className="profile-form-grid">
              <ProfileBasicForm
                formData={basicForm}
                formErrors={basicFormErrors}
                formMessage={basicFormMessage}
                isSubmitting={isSavingBasic}
                onFieldChange={handleBasicFieldChange}
                onSubmit={handleBasicSubmit}
              />
              <ProfilePasswordForm
                formData={passwordForm}
                formErrors={passwordFormErrors}
                formMessage={passwordFormMessage}
                isSubmitting={isSavingPassword}
                onFieldChange={handlePasswordFieldChange}
                onSubmit={handlePasswordSubmit}
              />
              <ProfileThemeForm
                themePreference={themePreference}
                onThemeChange={onThemePreferenceChange}
              />
            </section>
            <ProfileDeleteAccountForm
              formData={deleteForm}
              formErrors={deleteFormErrors}
              formMessage={deleteFormMessage}
              isSubmitting={isDeletingAccount}
              onFieldChange={handleDeleteFieldChange}
              onSubmit={handleDeleteSubmit}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}

export default ProfilePage;
