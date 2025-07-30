import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import dayjs from "dayjs";
import { useEffect } from "react";

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

    useEffect(() => {
    /** corre una vez por sesión */
    (async () => {
      const today = dayjs().startOf("day");

      // Recorre todas las metas
      const all = await db.goals.toArray();
      for (const g of all) {
        // último evento o fecha de creación
        const last = await db.events
          .where("goalId")
          .equals(g.id)
          .last();

        let cursor = dayjs(last?.timestamp ?? g.createdAt).startOf("day");

        while (cursor.isBefore(today, "day")) {
          cursor = cursor.add(1, "day");
          // ¿ya existe evento ese día?
          const exists = await db.events
            .where({ goalId: g.id })
            .filter((e) => dayjs(e.timestamp).isSame(cursor, "day"))
            .count();

          if (!exists) {
            await db.events.add({
              id: crypto.randomUUID(),
              goalId: g.id,
              delta: -1,
              timestamp: cursor.toDate(),
            });
          }
        }
      }
    })();
  }, []);

  return { goals, addGoal, updateGoal, addEvent, deleteGoal };
}
