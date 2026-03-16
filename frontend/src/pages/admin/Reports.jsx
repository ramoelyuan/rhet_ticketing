import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Loading from "../../components/Loading";
import {
  getCertificateTechnicianOfTheMonth,
  getCertificateTechnicianOfTheMonthByRating,
  reportCategoryDistribution,
  reportMonthlyTrends,
  reportTechnicianPerformance,
  reportTechnicianRankingMonth,
  reportTechnicianRatingRankingMonth,
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

const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Reports() {
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [ticketsPerTech, setTicketsPerTech] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [rankingMonth, setRankingMonth] = useState([]);
  const [ratingRankingMonth, setRatingRankingMonth] = useState([]);
  const [certMonth, setCertMonth] = useState(now.getMonth() + 1);
  const [certYear, setCertYear] = useState(now.getFullYear());
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState(null);
  const [certRatingLoading, setCertRatingLoading] = useState(false);
  const [certRatingError, setCertRatingError] = useState(null);

  useEffect(() => {
    Promise.all([
      reportTicketsPerTechnician().then((r) => r.data || []).catch(() => []),
      reportCategoryDistribution().then((r) => r.data || []).catch(() => []),
      reportMonthlyTrends().then((r) => r.data || []).catch(() => []),
      reportTechnicianPerformance().then((r) => r.data || []).catch(() => []),
      reportTechnicianRankingMonth().then((r) => r.data || []).catch(() => []),
      reportTechnicianRatingRankingMonth().then((r) => r.data || []).catch(() => []),
    ]).then(([a, b, c, d, e, f]) => {
      setTicketsPerTech(a);
      setCategoryDist(b);
      setMonthly(c);
      setPerformance(d);
      setRankingMonth(e);
      setRatingRankingMonth(f);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <div className="card min-h-64 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  const currentMonthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  function openCertModal() {
    setCertError(null);
    setCertRatingError(null);
    setCertModalOpen(true);
  }

  async function handleGenerateCertificate() {
    setCertError(null);
    setCertLoading(true);
    try {
      const blob = await getCertificateTechnicianOfTheMonth(certMonth, certYear);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      const a = document.createElement("a");
      a.href = url;
      a.download = `IT-Support-of-the-Month-${MONTH_OPTIONS[certMonth - 1]}-${certYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setCertModalOpen(false);
    } catch (err) {
      setCertError(err?.message || "Failed to generate certificate");
    } finally {
      setCertLoading(false);
    }
  }

  async function handleGenerateCertificateByRating() {
    setCertRatingError(null);
    setCertRatingLoading(true);
    try {
      const blob = await getCertificateTechnicianOfTheMonthByRating(certMonth, certYear);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      const a = document.createElement("a");
      a.href = url;
      a.download = `IT-Support-of-the-Month-by-Rating-${MONTH_OPTIONS[certMonth - 1]}-${certYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setCertModalOpen(false);
    } catch (err) {
      setCertRatingError(err?.message || "Failed to generate certificate");
    } finally {
      setCertRatingLoading(false);
    }
  }

  const certYearOptions = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 10; y--) certYearOptions.push(y);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Technician of the Month Certificate
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="cert-month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            <select
              id="cert-month"
              value={certMonth}
              onChange={(e) => setCertMonth(Number(e.target.value))}
              className="input-field min-w-[140px]"
            >
              {MONTH_OPTIONS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cert-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <select
              id="cert-year"
              value={certYear}
              onChange={(e) => setCertYear(Number(e.target.value))}
              className="input-field min-w-[100px]"
            >
              {certYearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={openCertModal}
            className="btn-primary"
          >
            Generate Certificate
          </button>
        </div>
      </div>
      {certModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => !certLoading && !certRatingLoading && setCertModalOpen(false)}>
            <div role="dialog" aria-modal="true" className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Choose certificate type</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                For {MONTH_OPTIONS[certMonth - 1]} {certYear}
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGenerateCertificate}
                  disabled={certLoading || certRatingLoading}
                  className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-slate-600 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {certLoading ? "Generating…" : "Technician of the Month (most resolved)"}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCertificateByRating}
                  disabled={certLoading || certRatingLoading}
                  className="w-full py-3 px-4 rounded-lg border border-gray-200 dark:border-slate-600 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {certRatingLoading ? "Generating…" : "Technician of the Month (top rating)"}
                </button>
              </div>
              {certError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{certError}</p>
              )}
              {certRatingError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{certRatingError}</p>
              )}
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                disabled={certLoading || certRatingLoading}
                className="mt-4 w-full py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>,
          document.getElementById("modal-root") || document.body
        )}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          IT Support rankings — {currentMonthLabel}
        </h2>
        {rankingMonth.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No resolved tickets this month yet.</p>
        ) : (
          <ul className="space-y-2">
            {rankingMonth.map((r) => (
              <li
                key={r.technician}
                className="flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    r.rank === 1
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      : r.rank === 2
                        ? "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
                        : r.rank === 3
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                          : "bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                  }`}
                >
                  {r.rank}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{r.technician}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                  {r.resolvedCount} resolved
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          IT Support ratings (by employee feedback) — {currentMonthLabel}
        </h2>
        {ratingRankingMonth.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No ratings this month yet.</p>
        ) : (
          <ul className="space-y-2">
            {ratingRankingMonth.map((r) => (
              <li
                key={r.technician}
                className="flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    r.rank === 1
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      : r.rank === 2
                        ? "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
                        : r.rank === 3
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                          : "bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                  }`}
                >
                  {r.rank}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{r.technician}</span>
                <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold ml-auto">
                  ★ {Number(r.avgRating).toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({r.ratingCount} rating{r.ratingCount !== 1 ? "s" : ""})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
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
