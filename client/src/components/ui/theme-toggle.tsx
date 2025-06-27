"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const themes = ["light", "dark", "system"] as const;
const icons = {
  light: <Sun className="h-5 w-5 text-yellow-500" />,
  dark: <Moon className="h-5 w-5 text-blue-500" />,
  system: <Laptop className="h-5 w-5 text-gray-500" />,
};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  // theme: 'light' | 'dark' | 'system' | undefined
  const current = theme === undefined ? "system" : theme;
  const currentIndex = themes.indexOf(current as typeof themes[number]);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  // Animasyon için state
  const [animating, setAnimating] = React.useState(false);
  const [iconKey, setIconKey] = React.useState(current);

  React.useEffect(() => {
    setIconKey(current);
  }, [current]);

  const handleClick = () => {
    setAnimating(true);
    setTimeout(() => {
      setTheme(nextTheme);
      setAnimating(false);
    }, 200); // animasyon süresi
  };

  return (
    <button
      aria-label="Tema değiştir"
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full transition-colors bg-muted hover:bg-primary/10 focus:outline-none overflow-hidden",
        animating && "ring-2 ring-primary/40"
      )}
      onClick={handleClick}
    >
      <span
        key={iconKey}
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out",
          animating ? "scale-0 opacity-0 rotate-45" : "scale-100 opacity-100 rotate-0"
        )}
      >
        {icons[current as keyof typeof icons]}
      </span>
      <span
        key={nextTheme}
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out",
          animating ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-45"
        )}
      >
        {icons[nextTheme as keyof typeof icons]}
      </span>
    </button>
  );
}