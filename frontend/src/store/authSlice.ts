import { createSlice } from "@reduxjs/toolkit";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants";

const initialState = {
  isLoggedIn: !!localStorage.getItem(ACCESS_TOKEN),
  accessToken: localStorage.getItem(ACCESS_TOKEN) || null,
  refreshToken: localStorage.getItem(REFRESH_TOKEN) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { access, refresh } = action.payload;

      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);

      state.accessToken = access;
      state.refreshToken = refresh;
      state.isLoggedIn = true;
    },

    updateAccessToken: (state, action) => {
      const access = action.payload;

      localStorage.setItem(ACCESS_TOKEN, access);
      state.accessToken = access;
    },

    logout: (state) => {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);

      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;

      window.location.href = "/login";
    },
  },
});

export const { login, logout, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;
