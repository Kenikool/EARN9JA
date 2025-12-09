import { useState } from "react";
import { usePreferences } from "../contexts/PreferencesContext";
import { useTranslation } from "../i18n/i18n";
import { toast } from "react-hot-toast";
import { Globe, DollarSign, Check } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

export default function GlobalSettings() {
  const { currency, language, setCurrency, setLanguage } = usePreferences();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleCurrencyChange = async (newCurrency: string) => {
    setLoading(true);
    try {
      await setCurrency(newCurrency);
      toast.success(t("settings.currencyUpdated"));
    } catch {
      toast.error(t("settings.currencyUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLoading(true);
    try {
      await setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
      toast.success(t("settings.languageUpdated"));
    } catch {
      toast.error(t("settings.languageUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("settings.globalSettings")}
          </h1>
          <p className="text-gray-600">
            {t("settings.globalSettingsDescription")}
          </p>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t("settings.preferredCurrency")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("settings.currencyDescription")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currency === curr.code
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {curr.code}
                    </div>
                    <div className="text-sm text-gray-600">{curr.name}</div>
                    <div className="text-lg font-bold text-green-600 mt-1">
                      {curr.symbol}
                    </div>
                  </div>
                  {currency === curr.code && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t("settings.preferredLanguage")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("settings.languageDescription")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition-all ${
                  language === lang.code
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {lang.name}
                      </div>
                      <div className="text-sm text-gray-600">{lang.code}</div>
                    </div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {t("settings.preview")}
          </h3>
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("settings.sampleProduct")}
              </span>
              <span className="font-semibold text-gray-900">
                {usePreferences().formatPrice(99.99)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("settings.language")}</span>
              <span className="font-semibold text-gray-900">
                {languages.find((l) => l.code === language)?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
