import { Tab } from "@headlessui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { ProgressChart } from "../components/ProgressChart";
import { HabitGrid } from "../components/HabitGrid";
import { GoalForm } from "../components/GoalForm";
import dayjs from "dayjs";
import { useState } from "react";
import type { Goal, Event } from "../db";

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /* ───── Modales ───── */
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  /* ───── Meta + eventos reactivos ───── */
  const { goal, events } =
    useLiveQuery(() => {
      if (!id) return { goal: undefined, events: [] as Event[] };
      return Promise.all([
        db.goals.get(id),
        db.events.where("goalId").equals(id).sortBy("timestamp"),
      ]).then(([g, ev]) => ({ goal: g, events: ev }));
    }, [id]) ?? { goal: undefined, events: [] };

  if (!goal) return null;

  /* ───── Métricas ───── */
  const netScore = events.reduce((s, e) => s + e.delta, 0);
  const totalEvents = events.length;

  /* Streak */
  let streak = 0;
  let cursor = dayjs().startOf("day");
  const grouped = new Map<string, Event[]>();
  events.forEach((ev) => {
    const k = dayjs(ev.timestamp).format("YYYY-MM-DD");
    grouped.set(k, [...(grouped.get(k) || []), ev]);
  });
  while (true) {
    const key = cursor.format("YYYY-MM-DD");
    const dayEvents = grouped.get(key) || [];
    if (dayEvents.some((e) => e.delta < 0)) break;
    streak += 1;
    cursor = cursor.subtract(1, "day");
    if (!grouped.has(cursor.format("YYYY-MM-DD"))) break;
  }

  /* ───── UI ───── */
  return (
    <div className="mx-auto max-w-md space-y-4 p-4 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-gray-200 px-3 py-1 text-sm
                     dark:bg-gray-700 dark:text-gray-100"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {goal.name}
        </h1>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <MetricCard label="Streak" value={streak} />
        <MetricCard label="Score" value={netScore} />
        <MetricCard label="Goal" value={goal.benchmark ?? "—"} />
        <MetricCard label="Total" value={totalEvents} />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Created: {dayjs(goal.createdAt).format("DD-MM-YYYY")}
        </p>
      </div>

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="mb-2 flex gap-4 border-b border-gray-200 text-sm dark:border-gray-700">
            {["Weekly", "Overall"].map((t) => (
                <Tab
                key={t}
                className={({ selected }) =>
                    selected
                    ? "border-b-2 border-blue-600 pb-1 text-gray-900 dark:border-blue-400 dark:text-gray-100"
                    : "pb-1 opacity-70 text-gray-700 dark:text-gray-400"
                }
                >
                {t}
                </Tab>
            ))}
            </Tab.List>

        <Tab.Panels>
          {/* WEEKLY */}
          <Tab.Panel className="space-y-4">
            <div className="h-64 overflow-auto">
              <ProgressChart goalId={goal.id} maxPoints={7} showLabels lineColor={goal.color} />
            </div>
            <div className="h-56 overflow-auto">
              <HabitGrid
                goalId={goal.id}
                color={goal.color}
                rows={8}
                cell={47}
                gap={5}
                showWeekdays
              />
            </div>
          </Tab.Panel>

          {/* OVERALL */}
          <Tab.Panel className="space-y-4">
            <div className="h-64 overflow-auto">
              <ProgressChart goalId={goal.id} showLabels={false} lineColor={goal.color} />
            </div>
            <div className="h-56 overflow-auto">
              <HabitGrid
                goalId={goal.id}
                color={goal.color}
                rows={8}
                cell={47}
                gap={5}
                showWeekdays
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Botones acción */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowEdit(true)}
          className="flex-1 rounded bg-gray-300 py-2 text-gray-900
                     dark:bg-gray-700 dark:text-gray-100"
        >
          Edit
        </button>
        <button
          onClick={() => setConfirmDel(true)}
          className="flex-1 rounded bg-red-600 py-2 text-white"
        >
          Delete
        </button>
      </div>

      {/* Modal Edit */}
      {showEdit && (
        <GoalForm initial={goal as Goal} onClose={() => setShowEdit(false)} />
      )}

      {/* Modal Delete */}
      {confirmDel && (
        <div className="fixed inset-0 grid place-items-center bg-black/40">
          <div className="space-y-4 rounded-lg bg-white p-6 text-center dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete this goal?
            </h2>
            <p className="text-sm opacity-80 dark:text-gray-300">
              All events will also be removed.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDel(false)}
                className="rounded bg-gray-300 px-4 py-2 dark:bg-gray-700 dark:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await db.goals.delete(goal.id);
                  await db.events.where("goalId").equals(goal.id).delete();
                  navigate("/");
                }}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg bg-gray-100 p-3 shadow dark:bg-gray-800">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
    </div>
  );
}

