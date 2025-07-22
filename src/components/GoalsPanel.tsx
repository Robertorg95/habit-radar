import AddGoalButton from "./AddGoalButton";
import { ThemeToggle } from "./ThemeToggle";
import { useGoals } from "../hooks/useGoals";
import { GoalCard } from "./GoalCard";

export function GoalsPanel() {
  const { goals } = useGoals();

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header fijo */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-4 py-3 backdrop-blur shadow-sm dark:bg-gray-800/80">
        <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100">
          Habit Radar
        </h1>
        <ThemeToggle />
      </header>

      {/* Lista de metas */}
      <ul className="list-none space-y-4 px-4 pb-28 pt-4">
        {goals.map((g) => (
            <GoalCard key={g.id} {...g} />
        ))}
        </ul>

      {/* Botón flotante para añadir meta */}
      <AddGoalButton />
    </div>
  );
}
