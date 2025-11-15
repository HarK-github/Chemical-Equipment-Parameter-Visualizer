import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";
import { AuthContext } from "./components/auth.tsx";

function Root() {
  return ( 
      <React.StrictMode>
        <BrowserRouter>
          <Provider>
            <App />
          </Provider>
        </BrowserRouter>
      </React.StrictMode> 
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
