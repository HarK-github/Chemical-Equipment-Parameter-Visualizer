import { useEffect } from "react";
import { Spinner } from "@heroui/spinner";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants";

export function Logout() {
  useEffect(() => { 
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    window.location.href = "/login";
  }, []);

  return (
    <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
      <Spinner variant="spinner" />
    </div>
  );
}
