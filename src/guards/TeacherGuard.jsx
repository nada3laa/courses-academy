import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  isActivated,
  isAwaitingApproval,
  isRegistrationIncomplete,
} from "../utils/roles";

const TeacherGuard = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (
    !isActivated(user) &&
    !isRegistrationIncomplete(user) &&
    !isAwaitingApproval(user)
  ) {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export default TeacherGuard;
