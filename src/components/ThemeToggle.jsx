import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      className="theme-toggle"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon"><Moon size={12} /></span>
      <span className="theme-toggle-icon"><Sun size={12} /></span>
      <span className="theme-toggle-knob" />
    </button>
  );
}
