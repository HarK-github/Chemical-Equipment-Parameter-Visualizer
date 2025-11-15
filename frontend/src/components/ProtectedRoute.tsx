import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "@/constants";

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

      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuth(true);
      } else {
        setIsAuth(false);
        addToast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          color: "warning",
          timeout: 5000,
        });
      }
    } catch (error) {
      console.log(error);
      setIsAuth(false);
      addToast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        color: "danger",
        timeout: 5000,
      });
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuth(false);
      addToast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        color: "primary",
        timeout: 4000,
      });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        await refreshToken();
      } else {
        setIsAuth(true);
      }
    } catch (error) {
      console.log(error);
      setIsAuth(false);
      addToast({
        title: "Invalid Token",
        description: "Please log in again to continue.",
        color: "danger",
        timeout: 5000,
      });
    }
  };

  if (isAuth === null) {
    return (
      <div className="absolute top-[50%] left-[50%]">
        <Spinner />
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;