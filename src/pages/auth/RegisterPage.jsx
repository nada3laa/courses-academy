import React from "react";
import { useLocation } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm";

const RegisterPage = () => {
  const location = useLocation();
  const accountType = location.state?.accountType || "student";

  return (
    <AuthLayout>
      <RegisterForm type={accountType} />
    </AuthLayout>
  );
};

export default RegisterPage;