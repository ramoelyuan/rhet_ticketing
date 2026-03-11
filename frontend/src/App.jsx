import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { useAuth } from "./hooks/useAuth";

import EmployeeDashboard from "./pages/employee/Dashboard";
import CreateTicket from "./pages/employee/CreateTicket";
import MyTickets from "./pages/employee/MyTickets";
import EmployeeTicketDetails from "./pages/employee/TicketDetails";

import AssignedTickets from "./pages/technician/AssignedTickets";
import WorkloadDashboard from "./pages/technician/WorkloadDashboard";
import TechnicianTicketDetails from "./pages/technician/TicketDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AllTickets from "./pages/admin/AllTickets";
import TechnicianManagement from "./pages/admin/TechnicianManagement";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import Reports from "./pages/admin/Reports";
import AdminTicketDetails from "./pages/admin/TicketDetails";
import ActivityLogs from "./pages/admin/ActivityLogs";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "EMPLOYEE") return <Navigate to="/employee" replace />;
  if (user.role === "TECHNICIAN") return <Navigate to="/technician" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/employee/*"
        element={
          <ProtectedRoute roles={["EMPLOYEE"]}>
            <AppLayout>
              <Routes>
                <Route path="" element={<EmployeeDashboard />} />
                <Route path="create" element={<CreateTicket />} />
                <Route path="tickets" element={<MyTickets />} />
                <Route path="tickets/:id" element={<EmployeeTicketDetails />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician/*"
        element={
          <ProtectedRoute roles={["TECHNICIAN"]}>
            <AppLayout>
              <Routes>
                <Route path="" element={<AssignedTickets />} />
                <Route path="workload" element={<WorkloadDashboard />} />
                <Route path="tickets/:id" element={<TechnicianTicketDetails />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppLayout>
              <Routes>
                <Route path="" element={<AdminDashboard />} />
                <Route path="tickets" element={<AllTickets />} />
                <Route path="tickets/:id" element={<AdminTicketDetails />} />
                <Route path="technicians" element={<TechnicianManagement />} />
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="activity" element={<ActivityLogs />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
