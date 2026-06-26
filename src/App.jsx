import { lazy, Suspense } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton from "./components/LoadingSkeleton";
import AppProvider from "./context/AppProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <SkeletonTheme baseColor="#fde7f2" highlightColor="#ffffff" borderRadius="1.25rem">
        <BrowserRouter>
          <Suspense
            fallback={
              <main className="app-shell min-h-screen p-6">
                <LoadingSkeleton />
              </main>
            }
          >
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              border: "1px solid #F6DCE8",
              borderRadius: "20px",
              boxShadow: "0 18px 60px rgb(190 24 93 / 0.14)",
              color: "#111827",
              fontWeight: 600,
            },
          }}
        />
        </SkeletonTheme>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
