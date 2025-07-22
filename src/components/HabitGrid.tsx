import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import dayjs from "dayjs";

interface Props {
  goalId: string;
  color?: string;
  rows?: number;
  cell?: number;
  gap?: number;
  showWeekdays?: boolean;
}

const weekdays = ["L", "M", "M", "J", "V", "S", "D"]; // Lunes a Domingo

export function HabitGrid({
  goalId,
  color = "#22c55e",
  rows = 8,
  cell = 14,
  gap = 2,
  showWeekdays = false,
}: Props) {
  const events =
    useLiveQuery(() => db.events.where({ goalId }).toArray(), [goalId]) ?? [];

  // Suma neta por día (YYYY-MM-DD)
  const byDay = new Map<string, number>();
  events.forEach((e) => {
    const key = dayjs(e.timestamp).format("YYYY-MM-DD");
    byDay.set(key, (byDay.get(key) || 0) + e.delta);
  });

  const totalCells = rows * 7;
  const cells: { key: string; success: boolean | null }[] = [];

  // Recorremos días desde hoy hacia atrás y los colocamos en su columna correspondiente
  for (let i = 0; i < totalCells; i++) {
    const date = dayjs().subtract(i, "day");
    const key = date.format("YYYY-MM-DD");
    const delta = byDay.get(key);
    const success = delta === undefined ? null : delta > 0;

    // Calcula posición en la grilla
    const col = (date.day() + 6) % 7; // Lunes=0 … Domingo=6
    const row = Math.floor(i / 7);

    cells[row * 7 + col] = { key, success };
  }

  const size = { width: cell, height: cell };

  return (
    <div>
      {/* Encabezado con iniciales de los días */}
      {showWeekdays && (
        <div
          className="mb-1 grid w-max text-[10px] font-medium text-gray-500"
          style={{ gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
        >
          {weekdays.map((d) => (
            <span key={d} className="text-center" style={{ width: cell }}>
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Cuadrícula principal */}
      <div
        className="grid w-max"
        style={{ gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
      >
        {cells.map(({ key, success }) => (
          <div
            key={key}
            title={key}
            style={{
              ...size,
              backgroundColor:
                success === null
                  ? "#e5e7eb" // gris claro
                  : success
                  ? color     // éxito
                  : "#9ca3af", // gris medio
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}


