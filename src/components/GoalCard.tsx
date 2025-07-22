import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import { useGoals } from "../hooks/useGoals";

interface Props {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export function GoalCard({
  id,
  name,
  icon = "🎯",
  color = "#3b82f6",
}: Props) {
  const navigate = useNavigate();
  const { addEvent } = useGoals();

  // ► contador reactivo – se actualiza al pulsar ±
  const count =
    useLiveQuery(
      () =>
        db.events
          .where("goalId")
          .equals(id)
          .toArray()
          .then((ev) => ev.reduce((s, e) => s + e.delta, 0)),
      [id],
    ) ?? 0;

  return (
    <li
      style={{ borderColor: color }}
      className="list-none rounded-xl border-l-8 bg-white p-4 shadow-sm dark:bg-gray-800"
    >
      <button
        onClick={() => navigate(`/goal/${id}`)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
          <span className="text-2xl">{icon}</span>
          {name}
        </span>
        <FaChevronRight className="text-gray-400" />
      </button>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => addEvent(id, +1)}
          className="btn-inc flex-1"
          title="Incrementar"
        >
          +
        </button>
        <button
          onClick={() => addEvent(id, -1)}
          className="btn-dec flex-1"
          title="Restar"
        >
          –
        </button>
        <span className="ml-auto self-center text-lg font-semibold text-gray-700 dark:text-gray-200">
          {count}
        </span>
      </div>
    </li>
  );
}

