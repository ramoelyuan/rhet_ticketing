import React, { useEffect, useState } from "react";
import {
  reportCategoryDistribution,
  reportMonthlyTrends,
  reportTechnicianPerformance,
  reportTicketsPerTechnician,
} from "../../services/admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#2563eb", "#0ea5e9", "#16a34a", "#f59e0b", "#ef4444", "#a855f7", "#64748b"];

export default function Reports() {
  const [ticketsPerTech, setTicketsPerTech] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    reportTicketsPerTechnician().then((r) => setTicketsPerTech(r.data || [])).catch(() => setTicketsPerTech([]));
    reportCategoryDistribution().then((r) => setCategoryDist(r.data || [])).catch(() => setCategoryDist([]));
    reportMonthlyTrends().then((r) => setMonthly(r.data || [])).catch(() => setMonthly([]));
    reportTechnicianPerformance().then((r) => setPerformance(r.data || [])).catch(() => setPerformance([]));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tickets per technician
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsPerTech}>
                <XAxis dataKey="technician" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Categories distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDist}
                  dataKey="tickets"
                  nameKey="category"
                  outerRadius={100}
                  label
                >
                  {categoryDist.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly ticket trends (last 12 months)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          IT support performance (resolved)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performance}>
              <XAxis dataKey="technician" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="resolvedCount" fill="#16a34a" radius={[8, 8, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
