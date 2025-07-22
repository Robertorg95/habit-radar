import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import dayjs from "dayjs";

export interface Goal {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  frequency?: "daily" | "multi";
  benchmark?: number;
  createdAt: Date;
}

export function useGoals() {
  /* 1️⃣  Metas en vivo ─ cada cambio en `db.goals` refresca el array */
  const goals = useLiveQuery(() => db.goals.toArray(), [], []) ?? [];

  /* 2️⃣  Crear meta nueva */
  const addGoal = useCallback(
    async (data: Omit<Goal, "id" | "createdAt">) => {
      const id = crypto.randomUUID();

      await db.goals.add(
        {
          id,
          createdAt: new Date(),
          ...data,
        } as any
      );
    },
    []
  );

  const updateGoal = useCallback(
    async (goalId: string, changes: Partial<Omit<Goal, "id">>) => {
        await db.goals.update(goalId, changes);
    },
    [],
    );


    const addEvent = useCallback(
    async (goalId: string, delta: number) => {
        const goal = await db.goals.get(goalId);
        if (!goal) return;

        // ► 1. Valida regla "Daily"
        if (goal.frequency === "daily") {
        const todayKey = dayjs().format("YYYY-MM-DD");

        const alreadyToday = await db.events
            .where({ goalId })
            .filter((e) => dayjs(e.timestamp).format("YYYY-MM-DD") === todayKey)
            .first();

        if (alreadyToday) {
            // Ya existe un movimiento hoy ⇒ cancela
            return;
        }
        }

        // ► 2. Guarda el evento
        await db.events.add({
        id: crypto.randomUUID(),
        goalId,
        delta,
        timestamp: new Date(),
        });
    },
    [],
    );


  /* 4️⃣  Borrar meta + cascada de eventos */
  const deleteGoal = useCallback(async (goalId: string) => {
    await db.transaction("rw", db.goals, db.events, async () => {
      await db.goals.delete(goalId);
      await db.events.where("goalId").equals(goalId).delete();
    });
  }, []);

  return { goals, addGoal, updateGoal, addEvent, deleteGoal };
}
