import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider as Pr } from "./provider.tsx";

import "@/styles/globals.css";
import { Provider } from "react-redux"; // ✅ REAL REDUX PROVIDER

import { store } from "./store/store.ts";

import { ToastProvider } from "@heroui/toast";

function Root() {
  return (
    <React.StrictMode>
      <ToastProvider />
      <BrowserRouter>
        <Pr>
          <Provider store={store}>
            <App />
          </Provider>
        </Pr>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
