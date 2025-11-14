import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants";

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  window.location.href = "/login"; // redirect to login page
};