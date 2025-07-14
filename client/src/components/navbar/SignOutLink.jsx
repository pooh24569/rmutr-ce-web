import React from "react";
import { SignOutButton } from "@clerk/clerk-react";
import { toast } from "sonner";

const SignOutLink = () => {
  const handleLogout = () => {
    toast.success("คุณได้ออกจากระบบเรียบร้อยแล้ว", {
      description: "Logout successful",
      duration: 10000,
    });
  };

  return (
    <SignOutButton redirectUrl="/">
      <button
        onClick={handleLogout}
        className="transition-all duration-300 ease-in-out bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        ออกจากระบบ
      </button>
    </SignOutButton>
  );
};

export default SignOutLink;
