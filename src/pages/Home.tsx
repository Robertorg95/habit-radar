// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useGoals } from "../hooks/useGoals";
import { GoalCard } from "../components/GoalCard";
import { useTheme } from "../hooks/useTheme";

export default function Home() {
  const { goals } = useGoals();
  const { dark, setDark } = useTheme();

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      {/* toggle dark / light */}
      <button
        onClick={() => setDark(!dark)}
        className="mb-2 text-sm underline"
      >
        {dark ? "Light" : "Dark"} mode
      </button>

      {/* botón crear */}
      <Link
        to="/new"
        className="block rounded bg-blue-600 px-4 py-2 text-center text-white"
      >
        + Add Goal
      </Link>

      {/* metas */}
      {goals?.map((g) => (
        <GoalCard key={g.id} {...g} />
      ))}
    </div>
  );
}

