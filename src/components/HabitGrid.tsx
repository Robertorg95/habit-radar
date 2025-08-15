import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import dayjs from "dayjs";

interface Props {
  goalId: string;
  color?: string;
  rows?: number;        // filas (semanas) visibles
  cell?: number;        // tamaño celda en px
  gap?: number;         // separación en px
  showWeekdays?: boolean;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"]; // Lunes → Domingo

export function HabitGrid({
  goalId,
  color = "#22c55e",
  rows = 8,
  cell = 16,
  gap = 3,
  showWeekdays = true,
}: Props) {
  // meta + eventos
  const goal = useLiveQuery(() => db.goals.get(goalId), [goalId]);
  const events =
    useLiveQuery(() => db.events.where({ goalId }).toArray(), [goalId]) ?? [];

  if (!goal) return null;

  // suma por día (YYYY-MM-DD)
  const byDay = new Map<string, number>();
  for (const e of events) {
    const k = dayjs(e.timestamp).format("YYYY-MM-DD");
    byDay.set(k, (byDay.get(k) ?? 0) + e.delta);
  }

  const today = dayjs().startOf("day");
  const created = dayjs(goal.createdAt).startOf("day");

  const total = rows * 7;

  // ⛑️ sin plugin: max(created, today - (total-1))
  const candidate = today.subtract(total - 1, "day");
  const windowStart = created.isAfter(candidate, "day") ? created : candidate;

  const toCol = (d: dayjs.Dayjs) => (d.day() + 6) % 7; // Lun=0…Dom=6

  type State = "pre" | "empty" | "pos" | "neg";
  const cells: { key: string; state: State }[] = Array(total);

  for (let i = 0; i < total; i++) {
    const d = windowStart.add(i, "day");
    const key = d.format("YYYY-MM-DD");

    let state: State = "empty";
    if (d.isBefore(created, "day")) {
      state = "pre";
    } else {
      const v = byDay.get(key);
      if (v != null) state = v > 0 ? "pos" : "neg";
    }

    const col = toCol(d);
    const row = Math.floor(i / 7);
    cells[row * 7 + col] = { key, state };
  }

  const square = { width: cell, height: cell };

  return (
    <div>
      {showWeekdays && (
        <div
          className="mb-1 grid w-max select-none text-[10px] font-medium text-gray-500 dark:text-gray-400"
          style={{ gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
        >
          {WEEKDAYS.map((d, i) => (
            <span key={`${d}-${i}`} className="text-center" style={{ width: cell }}>
              {d}
            </span>
          ))}
        </div>
      )}

      <div
        className="grid w-max"
        style={{ gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
      >
        {cells.map((c, idx) => {
          const bg =
            c.state === "pos"
              ? color
              : c.state === "neg"
              ? "#9ca3af"
              : "#e5e7eb";
          return (
            <div
              key={c?.key ?? `empty-${idx}`}
              title={c?.key}
              style={{ ...square, backgroundColor: bg, borderRadius: 3 }}
              className={c.state === "pre" ? "opacity-40" : ""}
            />
          );
        })}
      </div>
    </div>
  );
}


