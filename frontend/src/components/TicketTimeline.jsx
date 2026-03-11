import React from "react";
import {
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const ICON_MAP = {
  TICKET_CREATED: { label: "Ticket Created", Icon: ClockIcon, color: "bg-primary text-white" },
  ASSIGNED_TO_TECHNICIAN: { label: "Assigned to IT Support", Icon: UserIcon, color: "bg-sky-500 text-white" },
  TECHNICIAN_REPLIED: { label: "IT Support Replied", Icon: ChatBubbleLeftRightIcon, color: "bg-sky-500 text-white" },
  USER_REPLIED: { label: "User Replied", Icon: ChatBubbleLeftRightIcon, color: "bg-sky-500 text-white" },
  STATUS_UPDATED: { label: "Status Updated", Icon: ArrowPathIcon, color: "bg-amber-500 text-white" },
  TICKET_RESOLVED: { label: "Ticket Resolved", Icon: CheckCircleIcon, color: "bg-green-500 text-white" },
  INTERNAL_NOTE_ADDED: { label: "Internal Note", Icon: DocumentTextIcon, color: "bg-gray-500 text-white" },
};

function metaFor(type) {
  return ICON_MAP[type] || { label: type, Icon: ClockIcon, color: "bg-gray-500 text-white" };
}

export default function TicketTimeline({ events }) {
  return (
    <div className="card p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
      <div className="relative pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-slate-700" />
        <ul className="space-y-4">
          {(events || []).map((e) => {
            const { label, Icon, color } = metaFor(e.type);
            return (
              <li key={e.id} className="relative flex gap-3">
                <span
                  className={`absolute left-0 flex h-6 w-6 items-center justify-center rounded-full -translate-x-[2.15rem] ${color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(e.createdAt).toLocaleString()} • {e.actorName}
                  </p>
                  {e.message && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{e.message}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        {!events?.length && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet for this ticket.</p>
        )}
      </div>
    </div>
  );
}
