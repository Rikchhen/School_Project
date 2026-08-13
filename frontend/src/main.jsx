import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyle";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { RouterProvider } from "./lib/router";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { SettingsProvider } from "./context/SettingsContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ErrorBoundary>
        <LanguageProvider>
          <ToastProvider>
            <SettingsProvider>
              <SocketProvider>
                <AuthProvider>
                  <RouterProvider>
                    <App />
                  </RouterProvider>
                </AuthProvider>
              </SocketProvider>
            </SettingsProvider>
          </ToastProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
