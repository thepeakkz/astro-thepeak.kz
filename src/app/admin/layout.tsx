import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminPageTransition from "@/components/admin/AdminPageTransition";
import "@/components/cms/peak-cms-theme.css";
import "./admin-theme.css";

export const metadata: Metadata = {
  title: "CMS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="peak-cms peak-admin">
      <AdminHeader />
      <AdminPageTransition>{children}</AdminPageTransition>
    </div>
  );
}
