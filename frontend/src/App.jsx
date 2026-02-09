import "./styles.css";
import DesktopGate from "./components/DesktopGate";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <DesktopGate>
      <LandingPage />
    </DesktopGate>
  );
}

export default App;
