import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const WIDTH_EXPANDED = "16.25rem";
const WIDTH_COLLAPSED = "5rem";

export default function Sidebar({ items, mobileOpen, onClose, collapsed, onToggleCollapse, onDesktopExpandChange, hidden = false }) {
  const [hovered, setHovered] = useState(false);
  const desktopExpanded = hovered;

  function handleMouseEnter() {
    setHovered(true);
    onDesktopExpandChange?.(true);
  }
  function handleMouseLeave() {
    setHovered(false);
    onDesktopExpandChange?.(false);
  }

  const sidebarContent = (showExpanded) => (
    <div className="h-full flex flex-col shadow-sm shadow-black/5 dark:shadow-none bg-white dark:bg-[#061f28]">
      {/* Same height & color as header — right edge matches main header (no light border in light mode) */}
      <div className="h-16 px-4 flex items-center gap-2 shrink-0 bg-[#0a2e3c] border-r border-black/10 dark:border-b dark:border-white/10">
        <img src="/logo/rhetlogo.png" alt="Rhet" className="h-9 w-auto flex-shrink-0 object-contain" />
        {showExpanded && (
          <span className="text-sm font-bold uppercase text-white/80 truncate">IT Service Desk</span>
        )}
      </div>
      {/* Nav area: light vertical rule only here (not through dark header strip) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/95 dark:bg-[#061f28] backdrop-blur-md border-r border-black/10 dark:border-white/10">
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split("/").filter(Boolean).length === 1}
                onClick={mobileOpen ? onClose : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.disabled ? "pointer-events-none opacity-50" : ""
                  } ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-[#0a2e3c] hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10"
                  }`
                }
              >
                {Icon && (
                  <span className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                    {item.showDot && !showExpanded && (
                      <span
                        className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"
                        aria-hidden
                      />
                    )}
                  </span>
                )}
                {showExpanded && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.showDot && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" aria-hidden />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-2 border-t border-black/10 dark:border-white/10 flex justify-center md:hidden">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-[#839bb0] hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[${WIDTH_EXPANDED}] transform transition-transform duration-200 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: WIDTH_EXPANDED }}
      >
        {sidebarContent(true)}
      </aside>
      <aside
        className={`hidden md:block fixed top-0 left-0 z-30 h-full transition-all duration-200 ease-out bg-transparent ${
          hidden ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
        }`}
        style={{ width: desktopExpanded ? WIDTH_EXPANDED : WIDTH_COLLAPSED }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {sidebarContent(desktopExpanded)}
      </aside>
    </>
  );
}
