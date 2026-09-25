import type { ReactNode } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="print-hidden">
        <Navbar />
      </div>

      <div className="mx-auto grid max-w-[1128px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_260px]">
        <div className="print-hidden">
          <Sidebar />
        </div>

        <main className="min-w-0">{children}</main>

        <div className="print-hidden">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
