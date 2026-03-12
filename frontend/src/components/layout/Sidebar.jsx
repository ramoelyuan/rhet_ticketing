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
    <div className="h-full flex flex-col bg-[#f0f4ff]/95 dark:bg-slate-900 backdrop-blur-md border-r border-indigo-200/70 dark:border-slate-800 shadow-sm shadow-indigo-950/5">
      <div className="p-4 min-h-[4.5rem] flex flex-col justify-center">
        <span className="font-bold text-lg tracking-tight text-[#1e3a5f] dark:text-white truncate">
          {showExpanded ? "Rhet Ticketing" : "RT"}
        </span>
        {showExpanded && (
          <span className="text-xs text-slate-500 dark:text-gray-400">IT Service Desk</span>
        )}
      </div>
      <div className="border-t border-indigo-200/60 dark:border-slate-800" />
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
                    : "text-slate-700 dark:text-gray-300 hover:bg-indigo-100/80 dark:hover:bg-slate-800"
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
      <div className="p-2 border-t border-indigo-200/60 dark:border-slate-800 flex justify-center md:hidden">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-slate-500 hover:bg-indigo-100/80 dark:hover:bg-slate-800 dark:text-gray-400 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[${WIDTH_EXPANDED}] transform transition-transform duration-200 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: WIDTH_EXPANDED }}
      >
        {sidebarContent(true)}
      </aside>
      {/* Desktop sidebar: expand on hover, collapse when not hovered */}
      <aside
        className={`hidden md:block fixed top-0 left-0 z-30 h-full transition-all duration-200 ease-out bg-[#f0f4ff] dark:bg-slate-900 border-r border-indigo-200/70 dark:border-slate-800 ${
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
