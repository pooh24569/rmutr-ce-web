
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

const SignOutLink = () => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    toast.success("Signed out", {
      description: "You have been signed out successfully.",
      duration: 4000,
    });
    window.location.assign("/login");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="transition-all duration-300 ease-in-out bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
      >
        Sign out
      </button>

      <ConfirmDialog
        show={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default SignOutLink;