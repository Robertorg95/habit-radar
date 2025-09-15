// src/components/HabitGrid.tsx
// ---------------------------------------------------------------
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import dayjs from "dayjs";

interface Props {
  goalId: string;
  color?: string;
  cols?: number;     // columnas visibles (por defecto 7)
  cell?: number;     // tamaño del cuadro (px)
  gap?: number;      // espacio entre cuadros (px)
  showWeekdays?: boolean; // mantenida por compatibilidad, no se usa
}

export default function HabitGrid({
  goalId,
  color = "#22c55e",
  cols = 7,
  cell = 16,
  gap = 3,
  showWeekdays, // 👈 la recibimos…
}: Props) {
  void showWeekdays; // 👈 …y la “leemos” para evitar TS6133

  // Meta y eventos en vivo
  const goal = useLiveQuery(() => db.goals.get(goalId), [goalId]) ?? undefined;
  const events =
    useLiveQuery(() => db.events.where("goalId").equals(goalId).toArray(), [goalId]) ?? [];

  if (!goal) return null;

  // Sumarización por día (YYYY-MM-DD)
  const byDay = new Map<string, number>();
  for (const e of events) {
    const k = dayjs(e.timestamp).format("YYYY-MM-DD");
    byDay.set(k, (byDay.get(k) ?? 0) + e.delta);
  }

  const created = dayjs(goal.createdAt).startOf("day");
  const today = dayjs().startOf("day");

  // Días desde la creación hasta hoy (incl.)
  const days = Math.max(1, today.diff(created, "day") + 1);

  const cells: { key: string; bg: string; isToday: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const date = created.add(i, "day");
    const key = date.format("YYYY-MM-DD");
    const sum = byDay.get(key) ?? 0;

    let bg = "#e5e7eb"; // día pasado sin eventos (miss)
    if (sum > 0) bg = color;         // positivos
    else if (sum < 0) bg = "#9ca3af"; // negativos

    cells.push({ key, bg, isToday: date.isSame(today, "day") });
  }

  return (
    <div>
      <div
        className="grid w-max"
        style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}
      >
        {cells.map(({ key, bg, isToday }) => (
          <div
            key={key}
            title={key}
            style={{
              width: cell,
              height: cell,
              backgroundColor: bg,
              borderRadius: 3,
              boxShadow: isToday ? "0 0 0 2px rgba(59,130,246,.45) inset" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
