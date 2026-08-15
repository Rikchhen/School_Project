import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { GlobalStyle } from "./styles/GlobalStyle";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { RouterProvider } from "./lib/router";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { SettingsProvider } from "./context/SettingsContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <GlobalStyle />
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </ThemeModeProvider>
  </React.StrictMode>
);
