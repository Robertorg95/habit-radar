// src/components/HabitGrid.tsx
// ---------------------------------------------------------------
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import dayjs from "dayjs";

interface Props {
  goalId: string;
  color?: string;
  rows?: number;     // semanas visibles
  cell?: number;     // tamaño del cuadro (px)
  gap?: number;      // espacio entre cuadros (px)
  showWeekdays?: boolean;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"]; // Lunes → Domingo

// Lunes de la semana de 'd' (sin plugin)
function startOfMondayWeek(d: dayjs.Dayjs) {
  const dowMon0 = (d.day() + 6) % 7; // L=0, ... D=6
  return d.startOf("day").subtract(dowMon0, "day");
}

export default function HabitGrid({
  goalId,
  color = "#22c55e",
  rows = 8,
  cell = 16,
  gap = 3,
  showWeekdays = true,
}: Props) {
  // Meta + eventos en vivo
  const goal =
    useLiveQuery(() => db.goals.get(goalId), [goalId]) ?? undefined;

  const events =
    useLiveQuery(() => db.events.where("goalId").equals(goalId).toArray(), [
      goalId,
    ]) ?? [];

  if (!goal) return null;

  // Sumarización por día
  const byDay = new Map<string, number>();
  for (const e of events) {
    const k = dayjs(e.timestamp).format("YYYY-MM-DD");
    byDay.set(k, (byDay.get(k) ?? 0) + e.delta);
  }

  const today = dayjs().startOf("day");
  const created = dayjs(goal.createdAt).startOf("day");

  // Lunes de la semana actual
  const thisWeekMon = startOfMondayWeek(today);

  // Lunes del bloque más antiguo que se verá (rows semanas hacia atrás)
  const firstWeekMon = thisWeekMon.subtract(rows - 1, "week");

  // Construye las celdas (row = semana, col = día)
  const cells: {
    key: string;
    bg: string;
  }[] = [];

  for (let w = 0; w < rows; w++) {
    const weekMon = firstWeekMon.add(w, "week");
    for (let d = 0; d < 7; d++) {
      const date = weekMon.add(d, "day");
      const key = date.format("YYYY-MM-DD");

      let bg = "transparent";

      if (date.isAfter(today)) {
        // día futuro dentro de la semana actual → vacío
        bg = "transparent";
      } else if (date.isBefore(created)) {
        // antes de crear la meta → gris muy claro
        bg = "#f1f5f9";
      } else {
        const sum = byDay.get(key) ?? 0;
        if (sum > 0) bg = color;        // positivo
        else if (sum < 0) bg = "#9ca3af"; // negativo
        else bg = "#e5e7eb";              // pasado sin evento (miss)
      }

      cells.push({ key, bg });
    }
  }

  return (
    <div>
      {showWeekdays && (
        <div
          className="mb-1 grid w-max text-[11px] font-medium text-gray-500"
          style={{ gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
        >
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-center" style={{ width: cell }}>
              {d}
            </span>
          ))}
        </div>
      )}

      <div
        className="grid w-max"
        style={{ gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
      >
        {cells.map(({ key, bg }) => (
          <div
            key={key}
            title={key}
            style={{
              width: cell,
              height: cell,
              backgroundColor: bg,
              borderRadius: 3,
            }}
          />
        ))}
      </div>
    </div>
  );
}