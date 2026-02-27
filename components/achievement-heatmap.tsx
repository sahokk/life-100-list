"use client";

import { useState } from "react";

type Props = {
  data: Record<string, number>;
  initialYear: number;
};

const CELL_SIZE = 10;
const CELL_GAP = 2;
const DAYS_IN_WEEK = 7;
const DAY_LABELS = ["", "月", "", "水", "", "金", ""];
const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

function getColor(count: number, isDark: boolean): string {
  if (count === 0) return isDark ? "#27272a" : "#f4f4f5"; // zinc-800 / zinc-100
  if (count === 1) return isDark ? "#166534" : "#bbf7d0"; // green-800 / green-200
  if (count === 2) return isDark ? "#15803d" : "#4ade80"; // green-700 / green-400
  return isDark ? "#16a34a" : "#16a34a"; // green-600
}

function getDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateJP(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function AchievementHeatmap({ data, initialYear }: Props) {
  const [year, setYear] = useState(initialYear);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const currentYear = new Date().getFullYear();
  const days = getDaysInYear(year);

  // Calculate starting offset (what day of week does Jan 1 fall on)
  // JS: 0=Sun, we want 0=Mon
  const firstDayOfWeek = (days[0].getDay() + 6) % 7;

  // Build weeks grid
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Pad the first week with nulls
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === DAYS_IN_WEEK) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < DAYS_IN_WEEK) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Month label positions
  const monthPositions: { label: string; x: number }[] = [];
  let lastMonth = -1;
  for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
    for (const day of weeks[weekIdx]) {
      if (day && day.getMonth() !== lastMonth) {
        lastMonth = day.getMonth();
        monthPositions.push({
          label: MONTH_LABELS[lastMonth],
          x: weekIdx * (CELL_SIZE + CELL_GAP),
        });
        break;
      }
    }
  }

  const labelWidth = 24;
  const svgWidth = labelWidth + weeks.length * (CELL_SIZE + CELL_GAP);
  const svgHeight = 20 + DAYS_IN_WEEK * (CELL_SIZE + CELL_GAP);

  // Detect dark mode via CSS
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div>
      {/* Year navigation */}
      <div className="mb-3 flex items-center gap-3">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ←
        </button>
        <span className="text-sm font-medium">{year}年</span>
        <button
          onClick={() => setYear((y) => y + 1)}
          disabled={year >= currentYear}
          className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
        >
          →
        </button>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="select-none"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Month labels */}
          {monthPositions.map(({ label, x }) => (
            <text
              key={label}
              x={labelWidth + x}
              y={10}
              className="fill-zinc-400 text-[10px]"
            >
              {label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) => (
            label ? (
              <text
                key={i}
                x={0}
                y={20 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 1}
                className="fill-zinc-400 text-[10px]"
              >
                {label}
              </text>
            ) : null
          ))}

          {/* Cells */}
          {weeks.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              if (!day) return null;
              const dateStr = formatDate(day);
              const count = data[dateStr] ?? 0;
              const x = labelWidth + weekIdx * (CELL_SIZE + CELL_GAP);
              const y = 20 + dayIdx * (CELL_SIZE + CELL_GAP);

              return (
                <rect
                  key={dateStr}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  fill={getColor(count, isDark)}
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      text: `${formatDateJP(day)}: ${count}件達成`,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="cursor-pointer"
                />
              );
            })
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded bg-zinc-800 px-2 py-1 text-xs text-white shadow dark:bg-zinc-200 dark:text-zinc-900"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
        <span>少ない</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className="h-[10px] w-[10px] rounded-sm"
            style={{ backgroundColor: getColor(level, isDark) }}
          />
        ))}
        <span>多い</span>
      </div>
    </div>
  );
}
