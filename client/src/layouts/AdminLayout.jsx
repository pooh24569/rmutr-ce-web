import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <main className="container">
      <Navbar />
      <Outlet />
    </main>
  );
};

export default AdminLayout;
