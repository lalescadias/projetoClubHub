import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./modules/auth/components/ProtectedRoute";
import { AccountPage } from "./pages/AccountPage";
import { UsersPage } from "./pages/UsersPage";
import { VehicleDetailsPage } from "./pages/VehicleDetailsPage";
import { NotificationsPage } from "./pages/NotificationsPage";

export function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
