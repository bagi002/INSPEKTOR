import { useEffect, useState } from "react";
import DesktopNotice from "./DesktopNotice";

const DESKTOP_MIN_WIDTH = 1120;

function isDesktopWidth() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= DESKTOP_MIN_WIDTH;
}

function DesktopGate({ children }) {
  const [isDesktop, setIsDesktop] = useState(isDesktopWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(isDesktopWidth());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return <DesktopNotice minWidth={DESKTOP_MIN_WIDTH} />;
  }

  return children;
}

export default DesktopGate;
