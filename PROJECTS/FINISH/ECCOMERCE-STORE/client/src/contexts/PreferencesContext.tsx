import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../services/api";

interface PreferencesContextType {
  currency: string;
  language: string;
  setCurrency: (currency: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  formatPrice: (amount: number) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem("preferredCurrency") || "USD";
  });
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });

  // Set initial language and direction
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("preferredCurrency", newCurrency);

    // Try to save to backend if user is logged in
    try {
      await api.put("/auth/preferences", { preferredCurrency: newCurrency });
    } catch (error) {
      // Silently fail if not authenticated
      console.debug("Currency preference not saved to backend:", error);
    }
  };

  const setLanguage = async (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";

    // Try to save to backend if user is logged in
    try {
      await api.put("/auth/preferences", { preferredLanguage: newLanguage });
    } catch (error) {
      // Silently fail if not authenticated
      console.debug("Language preference not saved to backend:", error);
    }
  };

  const formatPrice = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      GHS: "₵",
      KES: "KSh",
      ZAR: "R",
      CAD: "C$",
      AUD: "A$",
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <PreferencesContext.Provider
      value={{ currency, language, setCurrency, setLanguage, formatPrice }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
