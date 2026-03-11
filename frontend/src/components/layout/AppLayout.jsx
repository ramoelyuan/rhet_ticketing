import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../hooks/useAuth";
import { listTickets } from "../../services/tickets";
import { adminDashboard } from "../../services/admin";
import {
  Squares2X2Icon,
  TicketIcon,
  PlusCircleIcon,
  UsersIcon,
  UserGroupIcon,
  FolderIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [ticketsDot, setTicketsDot] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const idleTimer = useRef(null);

  useEffect(() => {
    function clearTimer() {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    }

    function armTimer() {
      clearTimer();
      idleTimer.current = setTimeout(() => setUiHidden(true), 10 * 1000);
    }

    function onActivity() {
      if (uiHidden) setUiHidden(false);
      armTimer();
    }

    armTimer();

    const opts = { passive: true };
    window.addEventListener("mousemove", onActivity, opts);
    window.addEventListener("mousedown", onActivity, opts);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity, opts);
    window.addEventListener("touchstart", onActivity, opts);

    return () => {
      clearTimer();
      window.removeEventListener("mousemove", onActivity, opts);
      window.removeEventListener("mousedown", onActivity, opts);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity, opts);
      window.removeEventListener("touchstart", onActivity, opts);
    };
  }, [uiHidden]);

  useEffect(() => {
    if (!user) {
      setTicketsDot(false);
      return;
    }
    let cancelled = false;
    if (user.role === "EMPLOYEE" || user.role === "TECHNICIAN") {
      Promise.all([
        listTickets({ limit: 1, status: "OPEN" }),
        listTickets({ limit: 1, status: "IN_PROGRESS" }),
      ])
        .then(([openData, inProgressData]) => {
          if (!cancelled)
            setTicketsDot((openData.total || 0) > 0 || (inProgressData.total || 0) > 0);
        })
        .catch(() => {
          if (!cancelled) setTicketsDot(false);
        });
    } else if (user.role === "ADMIN") {
      adminDashboard()
        .then((data) => {
          const t = data.totals || {};
          if (!cancelled)
            setTicketsDot((t.open || 0) + (t.inProgress || 0) > 0);
        })
        .catch(() => {
          if (!cancelled) setTicketsDot(false);
        });
    } else {
      setTicketsDot(false);
    }
    return () => { cancelled = true; };
  }, [user]);

  const navItems = useMemo(() => {
    if (!user) return [];
    if (user.role === "EMPLOYEE") {
      return [
        { label: "Dashboard", to: "/employee", icon: Squares2X2Icon },
        { label: "Tickets", to: "/employee/tickets", icon: TicketIcon, showDot: ticketsDot },
        { label: "Create Ticket", to: "/employee/create", icon: PlusCircleIcon },
      ];
    }
    if (user.role === "TECHNICIAN") {
      return [
        { label: "Tickets", to: "/technician", icon: TicketIcon, showDot: ticketsDot },
        { label: "Workload", to: "/technician/workload", icon: ChartBarIcon },
      ];
    }
    return [
      { label: "Dashboard", to: "/admin", icon: Squares2X2Icon },
      { label: "Tickets", to: "/admin/tickets", icon: TicketIcon, showDot: ticketsDot },
      { label: "IT Supports", to: "/admin/technicians", icon: UsersIcon },
      { label: "Employees", to: "/admin/employees", icon: UserGroupIcon },
      { label: "Categories", to: "/admin/categories", icon: FolderIcon },
      { label: "Reports", to: "/admin/reports", icon: ChartBarIcon },
      { label: "Activity Logs", to: "/admin/activity", icon: ClipboardDocumentListIcon },
    ];
  }, [user, ticketsDot]);

  return (
    <div className="min-h-screen">
      <Sidebar
        items={navItems}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        hidden={uiHidden}
      />
      <div
        className={`min-h-screen flex flex-col transition-[margin-left] duration-150 ease-out ${
          collapsed ? "md:ml-20" : "md:ml-[16.25rem]"
        }`}
      >
        <div
          className={`transition-all duration-200 ${uiHidden ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}`}
        >
          <Topbar onMenu={() => setMobileOpen(true)} />
        </div>
        <main className="flex-1 px-4 md:px-6 py-6 md:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
