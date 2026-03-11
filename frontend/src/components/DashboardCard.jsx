import React from "react";

const colorMap = {
  primary: "bg-primary text-white",
  info: "bg-sky-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-amber-500 text-white",
  success: "bg-green-500 text-white",
  secondary: "bg-gray-500 text-white",
};

export default function DashboardCard({ icon: Icon, label, value, color = "primary" }) {
  const iconBg = colorMap[color] || colorMap.primary;
  return (
    <div className="card p-5 h-full flex items-center gap-4">
      <span className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </span>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
