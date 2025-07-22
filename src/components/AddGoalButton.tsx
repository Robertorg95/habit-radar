import { useState } from "react";
import { GoalForm } from "./GoalForm";

export default function AddGoalButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-10 h-14 w-14 rounded-full bg-blue-600 text-3xl text-white shadow-lg"
      >
        +
      </button>

      {open && <GoalForm onClose={() => setOpen(false)} />}
    </>
  );
}

