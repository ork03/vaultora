import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useVault } from "../hooks/useVault";
import Loader from "../components/common/Loader";
import AuthLayout from "../components/layout/AuthLayout";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import UnlockVaultPage from "../features/unlock/UnlockVaultPage";
import VaultPage from "../features/vault/VaultPage";
import PasswordGenerator from "../features/generator/PasswordGenerator";
import SettingsPage from "../features/settings/SettingsPage";
import { useAutoLock } from "../hooks/useAutoLock";
export default function AppRoutes() {
  const { user, status, logout } = useAuth();
  const { session, lock } = useVault();
  if (status === "loading") return <Loader />;
  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={session ? "/vault" : "/unlock"} />
          ) : (
            <AuthLayout>
              <LoginPage onRegister={() => location.assign("/register")} />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={session ? "/vault" : "/unlock"} />
          ) : (
            <AuthLayout>
              <RegisterPage onLogin={() => location.assign("/login")} />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/unlock"
        element={
          user ? (
            session ? (
              <Navigate to="/vault" />
            ) : (
              <UnlockVaultPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/vault"
        element={
          user && session ? (
            <Protected email={user.email} lock={lock} logout={logout}>
              <VaultPage />
            </Protected>
          ) : (
            <Navigate to={user ? "/unlock" : "/login"} />
          )
        }
      />
      <Route
        path="/generator"
        element={
          user && session ? (
            <Protected email={user.email} lock={lock} logout={logout}>
              <PasswordGenerator />
            </Protected>
          ) : (
            <Navigate to={user ? "/unlock" : "/login"} />
          )
        }
      />
      <Route
        path="/settings"
        element={
          user && session ? (
            <Protected email={user.email} lock={lock} logout={logout}>
              <SettingsPage />
            </Protected>
          ) : (
            <Navigate to={user ? "/unlock" : "/login"} />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={user ? (session ? "/vault" : "/unlock") : "/login"} />
        }
      />
    </Routes>
  );
}
function Protected({ email, lock, logout, children }) {
  useAutoLock(lock, true);
  return (
    <AppLayout email={email} onLock={lock} onLogout={logout} sidebar={null}>
      {children}
    </AppLayout>
  );
}
