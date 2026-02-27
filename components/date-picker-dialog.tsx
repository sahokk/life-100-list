"use client";

import { useState } from "react";

type DatePickerDialogProps = {
  open: boolean;
  currentDate: string | null;
  onConfirm: (date: string) => void;
  onCancel: () => void;
};

export default function DatePickerDialog({
  open,
  currentDate,
  onConfirm,
  onCancel,
}: DatePickerDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(
    currentDate ? new Date(currentDate).toISOString().split("T")[0] : today
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold">達成日を変更</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          達成した日付を選択してください
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="button"
            onClick={() => setDate(today)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            今日
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            キャンセル
          </button>
          <button
            onClick={() => onConfirm(date)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
