import { useCallback, useEffect, useState } from "react";
import { createSupportTicket, fetchMySupportTickets } from "../services/supportApi";
import { AUTH_ROUTES } from "../utils/routes";
import LoggedSidebar from "./LoggedSidebar";
import SupportTicketForm from "./SupportTicketForm";
import SupportTicketList from "./SupportTicketList";

const initialFormData = {
  ticketType: "bug_report",
  title: "",
  description: "",
  appLocation: "",
  appVersion: "main-web-frontend",
};

function SupportPage({ user, onLogout }) {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketErrorMessage, setTicketErrorMessage] = useState("");
  const [tickets, setTickets] = useState([]);

  const loadTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    setTicketErrorMessage("");

    const result = await fetchMySupportTickets();
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }

      setTicketErrorMessage(result.message || "Ucitavanje tiketa nije uspelo.");
      setIsLoadingTickets(false);
      return;
    }

    setTickets(Array.isArray(result.data?.tickets) ? result.data.tickets : []);
    setIsLoadingTickets(false);
  }, [onLogout]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormErrors((previous) => ({ ...previous, [name]: "" }));
    setFormMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormErrors({});
    setFormMessage("");
    setIsSubmitting(true);

    const result = await createSupportTicket(formData);
    setIsSubmitting(false);
    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }

      setFormErrors(result.errors || {});
      setFormMessage(result.message || "Kreiranje tiketa nije uspelo.");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      title: "",
      description: "",
      appLocation: "",
    }));
    setFormMessage(result.message || "Tiket je uspesno kreiran.");
    void loadTickets();
  }

  return (
    <div className="app-shell app-shell-logged">
      <LoggedSidebar activePath={AUTH_ROUTES.SUPPORT} user={user} onLogout={onLogout} />

      <main className="content logged-content">
        <section className="card support-hero reveal delay-1">
          <p className="eyebrow">Podrska korisnicima</p>
          <h2>Prijava baga i predloga</h2>
          <p>
            Kreiraj tiket sa jasnim opisom problema ili predloga. U nastavku mozes pratiti sve
            svoje prijave i njihove statuse.
          </p>
        </section>

        <section className="card reveal delay-2">
          <h3>Novi tiket</h3>
          <SupportTicketForm
            formData={formData}
            formErrors={formErrors}
            formMessage={formMessage}
            isSubmitting={isSubmitting}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
          />
        </section>

        <section className="card reveal delay-3">
          <h3>Moji ticketi</h3>
          <SupportTicketList
            isLoadingTickets={isLoadingTickets}
            ticketErrorMessage={ticketErrorMessage}
            tickets={tickets}
          />
        </section>
      </main>
    </div>
  );
}

export default SupportPage;
