// src/components/WeeklyHeatmap.tsx
// ---------------------------------------------------------------------------
import "react-calendar-heatmap/dist/styles.css";
import Heatmap from "react-calendar-heatmap";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";

/** Shape que react-calendar-heatmap espera en `values` */
type HeatValue = { date: string; count: number };

interface Props {
  goalId: string;
}

export function WeeklyHeatmap({ goalId }: Props) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lunes

  /** Eventos de la meta, reactivos */
  const events =
    useLiveQuery(() => db.events.where({ goalId }).toArray(), [goalId]) ?? [];

  /** Construye 7 celdas (Mon…Sun) */
  const values: HeatValue[] = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(weekStart, i);

    const total = events
      .filter((e) => isSameDay(e.timestamp, day))
      .reduce((s, e) => s + e.delta, 0);

    return { date: format(day, "yyyy-MM-dd"), count: total };
  });

  return (
    <Heatmap
      startDate={weekStart}
      endDate={addDays(weekStart, 6)}
      values={values}
      classForValue={(v?: HeatValue) =>
        !v || v.count === 0
          ? "color-empty"
          : v.count >= 3
          ? "color-full"
          : "color-half"
      }
      gutterSize={3}
      showWeekdayLabels
    />
  );
}


