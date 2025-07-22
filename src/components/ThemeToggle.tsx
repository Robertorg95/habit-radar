import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="text-xl"
      title="Cambiar tema"
    >
      {dark ? "🌑" : "☀️"}
    </button>
  );
};
