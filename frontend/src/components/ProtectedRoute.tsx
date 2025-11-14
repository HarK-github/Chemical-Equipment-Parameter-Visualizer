import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import api from "../api";

import { REFRESH_TOKEN, ACCESS_TOKEN } from "@/constants";

//eslint disable
function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    auth().catch(() => setIsAuth(false));
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    try {
      const res = await api.post("/api/token/refresh", {
        refresh: refreshToken,
      });

      if (res.status == 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
      } else {
        setIsAuth(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    }
  };
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuth(false);

      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      await refreshToken();
    } else {
      setIsAuth(true);
    }
  };

  if (isAuth == null) {
    return <div className="absolute top-[50%] left-[50%] "><Spinner /></div>;
  }

  return isAuth ? children : <Navigate to="/login" />;
}
export default ProtectedRoute;
