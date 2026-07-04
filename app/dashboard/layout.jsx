import React from "react";
import Header from "./_components/Header";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#1e293b_0%,#020617_48%,#0f172a_100%)] text-white">
      <Header />
      <main className="min-h-screen md:pl-72">{children}</main>
    </div>
  );
}

export default DashboardLayout;
