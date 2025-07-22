// src/components/GoalForm.tsx
// --------------------------------------------------------------------------
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useGoals } from "../hooks/useGoals";
import type { Goal } from "../db";

interface Props {
  onClose: () => void;
  /** undefined → nuevo;   meta → edita */
  initial?: Goal;
}

export function GoalForm({ onClose, initial }: Props) {
  const isEdit = !!initial;
  const { addGoal, updateGoal } = useGoals();

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    frequency: initial?.frequency ?? ("daily" as "daily" | "multi"),
    benchmark: initial?.benchmark ?? 0,
    icon: initial?.icon ?? "🎯",
    color: initial?.color ?? "#3b82f6",
  });

  const submit = () => {
    if (isEdit) {
      updateGoal(initial!.id, form);
    } else {
      addGoal(form);
    }
    onClose();
  };

  /* === CLASES REUTILIZABLES === */
  const inputCls =
    "mb-2 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm " +
    "text-gray-900 focus:outline-none focus:ring dark:border-gray-600 " +
    "dark:bg-gray-700 dark:text-gray-100";

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-80 max-w-md rounded bg-white p-6 shadow-lg dark:bg-gray-800">
                <Dialog.Title className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {isEdit ? "Edit Goal" : "New Goal"}
                </Dialog.Title>

                <input
                  className={inputCls}
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <select
                  className={inputCls}
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      frequency: e.target.value as "daily" | "multi",
                    })
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="multi">Multiple / day</option>
                </select>

                <input
                  type="number"
                  className={inputCls}
                  placeholder="Benchmark"
                  value={form.benchmark}
                  onChange={(e) =>
                    setForm({ ...form, benchmark: +e.target.value })
                  }
                />

                <div className="mb-4 flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <span>Icon:</span>
                  <input
                    className="w-14 rounded border border-gray-300 bg-white px-2 py-1 text-center text-sm
                               dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    value={form.icon}
                    maxLength={2}
                    onChange={(e) =>
                      setForm({ ...form, icon: e.target.value })
                    }
                  />
                  <span>Color:</span>
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                    disabled={!form.name.trim()}
                  >
                    Save
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
