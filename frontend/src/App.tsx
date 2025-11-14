import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/register";
import DefaultLayout from "./layouts/default";

import HomePage from "@/pages/home";
import DashboardPage from "@/pages/dashboard";
import Login from "@/pages/login";

function App() {
  return (
    <DefaultLayout>
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
      </Routes>
    </DefaultLayout>
  );
}

export default App;
