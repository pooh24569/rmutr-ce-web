import React from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const SignOutLink = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // เคลียร์ state + localStorage
    toast.success("คุณได้ออกจากระบบเรียบร้อยแล้ว", {
      description: "Logout successful",
      duration: 4000,
    });
    window.location.assign("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="transition-all duration-300 ease-in-out bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      ออกจากระบบ
    </button>
  );
};

export default SignOutLink;
