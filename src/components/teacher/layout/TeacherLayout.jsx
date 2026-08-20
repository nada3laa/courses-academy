import { useState, useEffect, useRef } from "react";
import TeacherSidebar from "./TeacherSidebar";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import { AccountStatusNotice } from "../../account-settings/AccountRegistrationStatus";

const MOBILE_BREAKPOINT = 768;

const getInitialSidebarState = () => {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= MOBILE_BREAKPOINT;
};

const TeacherLayout = ({ children, breadcrumbLabels, breadcrumbCurrentLabel }) => {

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
    <div className="h-screen flex bg-[#F5F7FB] overflow-hidden">
     
      <div className="h-full shrink-0">
        <TeacherSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>
      <main className="flex-1 h-full overflow-y-auto p-3 md:p-6">
         <Breadcrumbs
           homeTo="/teacher-dashboard"
           dynamicLabels={breadcrumbLabels}
           currentPageLabel={breadcrumbCurrentLabel}
         />

        <AccountStatusNotice />

        {children}
      </main>

    </div>
  );
};

export default TeacherLayout;
