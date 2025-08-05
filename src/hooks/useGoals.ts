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

/* -------------------------------------------------------------------------- */
/*  HOOK PRINCIPAL                                                            */
/* -------------------------------------------------------------------------- */
export function useGoals() {
  /* 1️⃣  Metas reactivas */
  const goals = useLiveQuery(() => db.goals.toArray(), [], []) ?? [];

  /* 2️⃣  CRUD Metas -------------------------------------------------------- */
  const addGoal = useCallback(
    async (data: Omit<Goal, "id" | "createdAt">) => {
      await db.goals.add({
        id: crypto.randomUUID(),
        createdAt: new Date(),
        ...data,
      } as any);
    },
    []
  );

  const updateGoal = useCallback(
    (goalId: string, changes: Partial<Omit<Goal, "id">>) =>
      db.goals.update(goalId, changes),
    []
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      await db.transaction("rw", db.goals, db.events, async () => {
        await db.goals.delete(goalId);
        await db.events.where("goalId").equals(goalId).delete();
      });
    },
    []
  );

  /* 3️⃣  Eventos ----------------------------------------------------------- */
  const addEvent = useCallback(
    async (goalId: string, delta: number) => {
      const goal = await db.goals.get(goalId);
      if (!goal) return;

      /* Regla “daily”: un solo movimiento al día */
      if (goal.frequency === "daily") {
        const todayKey = dayjs().format("YYYY-MM-DD");
        const todayEvt = await db.events
          .where({ goalId })
          .filter((e) => dayjs(e.timestamp).format("YYYY-MM-DD") === todayKey)
          .first();
        if (todayEvt) return; // ya existe algo hoy
      }

      await db.events.add({
        id: crypto.randomUUID(),
        goalId,
        delta,
        timestamp: new Date(),
      });
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  return { goals, addGoal, updateGoal, addEvent, deleteGoal };
}

