import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/register";
import DefaultLayout from "./layouts/default";

import HomePage from "@/pages/home";
import DashboardPage from "@/pages/dashboard";
import Login from "@/pages/login";
import { logout as Logout } from "./pages/logout";

function App() {
  return (
    <DefaultLayout>
      <div
        className="absolute inset-0 -z-10 fixed"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #000000 40%, #2b092b 100%)",
        }}
      />

      {/* Your content here */}
      <Routes>
        <Route element={<Login />} path="/login" />

        <Route element={<Register />} path="/register" />
        <Route
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
          path="/"
        />
        <Route
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
          path="/dashboard"
        />
        <Route
          element={
            <ProtectedRoute>
              <Logout/>
            </ProtectedRoute>
          }
          path="/logout"
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
