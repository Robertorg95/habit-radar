// src/components/HabitGrid.tsx
// --------------------------------------------------------------------------
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import dayjs from "dayjs";

interface Props {
  goalId: string;
  createdAt: Date;          // 👈 fecha de alta del hábito
  color?: string;           // color positivo (línea / celdas)
  rows?: number;            // nº de semanas visibles (8 = 56 días)
  cell?: number;            // lado de la celda en px
  gap?: number;             // separación en px
  showWeekdays?: boolean;   // muestra cabecera L-M-M-J-V-S-D
}

const weekdays = ["L", "M", "M", "J", "V", "S", "D"]; // Lun-Dom

export function HabitGrid({
  goalId,
  createdAt,
  color = "#22c55e",
  rows = 8,
  cell = 14,
  gap = 2,
  showWeekdays = false,
}: Props) {
  /* -------- 1· Eventos agrupados por día -------------------------------- */
  const events =
    useLiveQuery(() => db.events.where({ goalId }).toArray(), [goalId]) ?? [];

  /** mapa YYYY-MM-DD → suma del día  */
  const byDay = new Map<string, number>();
  events.forEach((e) => {
    const key = dayjs(e.timestamp).format("YYYY-MM-DD");
    byDay.set(key, (byDay.get(key) ?? 0) + e.delta);
  });

  /* -------- 2· Construir celdas últimas rows*7 jornadas ------------------ */
  const totalCells = rows * 7;
  const cells: { key: string; state: "pre" | "pos" | "neg" | "none" }[] = [];

  for (let i = 0; i < totalCells; i++) {
    const date = dayjs().startOf("day").subtract(i, "day");
    const key = date.format("YYYY-MM-DD");

    // posición en grilla (Lunes-0 … Domingo-6)
    const col = (date.day() + 6) % 7;
    const row = Math.floor(i / 7);

    /* Estado visual de la celda ------------------------------------------ */
    let state: "pre" | "pos" | "neg" | "none" = "none";

    if (date.isBefore(dayjs(createdAt).startOf("day"))) {
      state = "pre";                    // anterior a la creación
    } else {
      const delta = byDay.get(key);
      if (delta === undefined) state = "none";   // sin registrar (gris claro)
      else state = delta > 0 ? "pos" : "neg";    // verde / gris medio
    }

    cells[row * 7 + col] = { key, state };
  }

  /* -------- 3· Render ---------------------------------------------------- */
  const sizeStyle = { width: cell, height: cell };

  return (
    <div>
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

      <div
        className="grid w-max"
        style={{ gridTemplateColumns: `repeat(7, ${cell}px)`, gap }}
      >
        {cells.map(({ key, state }) => {
          let bg = "#e5e7eb";
          if (state === "pre") bg = "#f3f4f6";
          if (state === "neg") bg = "#9ca3af";
          if (state === "pos") bg = color;

          return (
            <div
              key={key}
              title={key}
              style={{
                ...sizeStyle,
                backgroundColor: bg,
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}



