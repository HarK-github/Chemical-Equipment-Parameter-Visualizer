import { Route, Routes } from "react-router-dom";

import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import DashboardPage from "@/pages/dashboard";

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login"  />
      <Route element={<HomePage />} path="/" />
      <Route element={<DashboardPage />} path="/dashboard"  />
     </Routes>
  );
}

export default App;
