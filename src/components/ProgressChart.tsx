import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from "chart.js";
import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

interface Props {
  goalId: string;
  maxPoints?: number;
  lineColor?: string;
  showLabels?: boolean;
}

export function ProgressChart({
  goalId,
  lineColor = "#2563eb",
  maxPoints,
  showLabels = true,
}: Props) {
  const events = useLiveQuery(
    () => db.events.where("goalId").equals(goalId).sortBy("timestamp"),
    [goalId],
  );

  if (!events) return null;

  const slice = maxPoints ? events.slice(-maxPoints) : events;

  let acc = 0;
  const labels: string[] = [];
  const data: number[] = [];

  slice.forEach((_, i) => {
    acc += slice[i].delta;
    labels.push(String(i + 1));
    data.push(acc);
  });

  const border = lineColor;
  const fill   =
    lineColor.startsWith("#") && lineColor.length === 7
      ? `${lineColor}55`
      : lineColor;     

  const chartData = {
    labels,
    datasets: [
      {
        data,
        tension: 0.3,
        borderColor: border,
        backgroundColor: fill,
        pointRadius: 3,
      },
    ],
  };

    const isDark = document.documentElement.classList.contains("dark");
    const axisColor = isDark ? "#9ca3af" : "#6b7280";
    const gridColor = isDark ? "#374151" : "#e5e7eb";

    const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: axisColor },
            grid: { color: gridColor },
        },
        x: {
            grid: { display: false },
            ticks: {
            display: showLabels,
            autoSkip: !showLabels,
            maxRotation: 0,
            color: axisColor,
            },
        },
        },
    };

  // Scroll horizontal solo si se muestra etiquetas y hay >14 puntos
  const needScroll = showLabels && slice.length > 14;
  const baseWidth = 7 * 47;
  const dynamicWidth = needScroll ? slice.length * 40 : baseWidth; 

    return (
    <div className={needScroll ? "overflow-x-auto" : ""}>
        {/* ► alto fijo (h-56 ≈ 288 px) + ancho dinámico */}
        <div
        className="h-56"
        style={{ width: dynamicWidth }}
        >
        <Line data={chartData} options={options} />
        </div>
    </div>
    );
}
