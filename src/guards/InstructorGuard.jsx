import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const InstructorGuard = ({ children }) => {
  const { user, checkingAccountState } = useContext(AuthContext);

  if (checkingAccountState) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.accountType !== "instructor" || user.instructorStatus === "suspended") {
    return <Navigate to="/teacher-dashboard" replace state={{ becomeInstructor: true }} />;
  }
  return children;
};

export default InstructorGuard;
