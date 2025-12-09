import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { registerServiceWorker } from "./utils/pwa";
import { useCartStore } from "./stores/cartStore";
import "./i18n/i18n";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          {PUBLISHABLE_KEY ? (
            <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
              <PreferencesProvider>
                <App />
              </PreferencesProvider>
            </ClerkProvider>
          ) : (
            <PreferencesProvider>
              <App />
            </PreferencesProvider>
          )}
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);

// Initialize cart on app start
useCartStore.getState().loadCart();

// Register service worker for PWA
registerServiceWorker();
