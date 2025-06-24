"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";

interface LoginButtonProps {}

export const LoginButton: React.FC<LoginButtonProps> = ({}) => {
  const { isAuthenticated, logout, login } = useAuth();

  if (isAuthenticated) {
    return (
      <button
        onClick={logout}
        className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors`}
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors`}
    >
      Login In
    </button>
  );
};
