function DesktopNotice({ minWidth }) {
  return (
    <main className="desktop-notice">
      <div className="desktop-notice-card">
        <p className="notice-kicker">INSPEKTOR</p>
        <h1>Aplikacija je trenutno dostupna samo na desktop uredjajima.</h1>
        <p>
          Zahtev za javnu stranicu je implementiran kao desktop-only iskustvo,
          sa sirim prikazom i vecim radnim prostorom.
        </p>
        <p>Minimalna preporucena sirina ekrana: {minWidth}px.</p>
      </div>
    </main>
  );
}

export default DesktopNotice;
