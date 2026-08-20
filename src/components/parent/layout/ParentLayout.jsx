import { useState, useEffect, useRef } from "react";
import ParentSidebar from "./ParentSidebar";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import { AccountStatusNotice } from "../../account-settings/AccountRegistrationStatus";

const MOBILE_BREAKPOINT = 768;

const getInitialSidebarState = () => {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= MOBILE_BREAKPOINT;
};

const ParentLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(getInitialSidebarState);
  const wasAboveBreakpoint = useRef(getInitialSidebarState());

  useEffect(() => {
    const handleResize = () => {
      const isAboveBreakpoint = window.innerWidth >= MOBILE_BREAKPOINT;
      if (isAboveBreakpoint !== wasAboveBreakpoint.current) {
        wasAboveBreakpoint.current = isAboveBreakpoint;
        setIsOpen(isAboveBreakpoint);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-dvh bg-[#F5F7FB] overflow-hidden">
      <div className="h-full shrink-0">
        <ParentSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-6">
         <Breadcrumbs homeTo="/parent-dashboard" />
        <AccountStatusNotice />
        {children}
      </main>

    </div>
  );
};

export default ParentLayout;
