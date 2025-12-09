import { useState, useEffect } from "react";
import { Palette } from "lucide-react";

const THEMES = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "corporate", label: "Corporate" },
  { name: "business", label: "Business" },
  { name: "luxury", label: "Luxury" },
  { name: "emerald", label: "Emerald" },
  { name: "forest", label: "Forest" },
  { name: "winter", label: "Winter" },
  { name: "nord", label: "Nord" },
  { name: "sunset", label: "Sunset" },
];

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <Palette className="w-5 h-5" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-10 menu p-2 shadow-2xl bg-base-100 rounded-box w-52"
      >
        <li className="menu-title">
          <span>Choose Theme</span>
        </li>
        {THEMES.map(({ name, label }) => (
          <li key={name}>
            <button
              className={`${theme === name ? "active" : ""}`}
              onClick={() => setTheme(name)}
            >
              <span>{label}</span>
              {theme === name && <span className="text-primary">✓</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSwitcher;
