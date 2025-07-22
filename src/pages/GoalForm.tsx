import { useState } from "react";
import { db } from "../db";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { HexColorPicker } from "react-colorful";
import { FaRunning, FaBook, FaUtensils } from "react-icons/fa";

const icons = [
  { value: "FaRunning", label: <FaRunning /> },
  { value: "FaBook", label: <FaBook /> },
  { value: "FaUtensils", label: <FaUtensils /> },
];

export default function GoalForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "multi">("daily");
  const [benchmark, setBenchmark] = useState<number | "">("");
  const [icon, setIcon] = useState(icons[0].value);
  const [color, setColor] = useState("#3b82f6");

  const save = async () => {
    if (!name.trim()) return;

    const id = crypto.randomUUID();
    await db.goals.add({
      id,
      name: name.trim(),
      frequency,
      benchmark: benchmark === "" ? undefined : Number(benchmark),
      icon,
      color,
      createdAt: new Date(),
    });

    navigate("/");
  };

  return (
    <div className="mx-auto max-w-sm space-y-4 p-4">
      <h1 className="text-2xl font-bold">Nueva Meta</h1>

      {/* Nombre */}
      <input
        className="w-full rounded border p-2"
        placeholder="Nombre…"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Frecuencia */}
      <Select
        options={[
          { value: "daily", label: "Diaria" },
          { value: "multi", label: "Varias veces al día" },
        ]}
        defaultValue={{ value: "daily", label: "Diaria" }}
        onChange={(opt) => setFrequency(opt!.value as "daily" | "multi")}
      />

      {/* Benchmark */}
      <input
        type="number"
        className="w-full rounded border p-2"
        placeholder="Benchmark (opcional)"
        value={benchmark}
        onChange={(e) =>
          setBenchmark(e.target.value === "" ? "" : Number(e.target.value))
        }
      />

      {/* Icono */}
      <Select
        options={icons}
        defaultValue={icons[0]}
        onChange={(opt) => setIcon(opt!.value)}
        formatOptionLabel={(opt) => (
          <span className="flex items-center gap-2">{opt.label}</span>
        )}
      />

      {/* Color */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Color del borde
        </label>
        <HexColorPicker
          color={color}
          onChange={setColor}
          className="h-36 w-full"
        />
      </div>

      {/* Botón guardar */}
      <button
        onClick={save}
        className="w-full rounded bg-blue-600 py-2 text-white"
      >
        Guardar
      </button>
    </div>
  );
}
