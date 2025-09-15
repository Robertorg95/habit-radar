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
  showWeekdays?: boolean; // ya no se usa (lo dejamos por compatibilidad)
}

export default function HabitGrid({
  goalId,
  color = "#22c55e",
  cols = 7,
  cell = 16,
  gap = 3,
}: Props) {
  // Meta y eventos en vivo
  const goal = useLiveQuery(() => db.goals.get(goalId), [goalId]) ?? undefined;
  const events =
    useLiveQuery(() => db.events.where("goalId").equals(goalId).toArray(), [
      goalId,
    ]) ?? [];

  if (!goal) return null;

  // Sumarización por día (YYYY-MM-DD)
  const byDay = new Map<string, number>();
  for (const e of events) {
    const k = dayjs(e.timestamp).format("YYYY-MM-DD");
    byDay.set(k, (byDay.get(k) ?? 0) + e.delta);
  }

  const created = dayjs(goal.createdAt).startOf("day");
  const today = dayjs().startOf("day");

  // Número de días desde que se creó la meta hasta HOY (inclusive)
  const days = Math.max(1, today.diff(created, "day") + 1);

  // Construye celdas en orden continuo desde createdAt → hoy
  const cells: { key: string; bg: string; isToday: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const date = created.add(i, "day");
    const key = date.format("YYYY-MM-DD");
    const sum = byDay.get(key) ?? 0;

    let bg = "#e5e7eb"; // default: día pasado sin eventos (miss)
    if (sum > 0) bg = color;
    else if (sum < 0) bg = "#9ca3af";

    cells.push({ key, bg, isToday: date.isSame(today, "day") });
  }

  return (
    <div>
      {/* Grid continuo (sin encabezado de días) */}
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
              // borde sutil para “hoy” (opcional)
              boxShadow: isToday ? "0 0 0 2px rgba(59,130,246,.45) inset" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
