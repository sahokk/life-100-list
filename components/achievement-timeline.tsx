"use client";

type TimelineItem = {
  id: string;
  title: string;
  completed_at: string;
};

type Props = {
  items: TimelineItem[];
};

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function AchievementTimeline({ items }: Readonly<Props>) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500">まだ達成したアイテムはありません</p>
    );
  }

  // Group by month
  const grouped = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const key = formatMonthYear(item.completed_at);
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([monthLabel, monthItems]) => (
        <div key={monthLabel}>
          <h3 className="mb-2 text-sm font-semibold text-zinc-500">
            {monthLabel}
            <span className="ml-2 text-xs font-normal text-zinc-400">
              {monthItems.length}件
            </span>
          </h3>
          <div className="relative ml-3 border-l-2 border-green-200 pl-5 dark:border-green-900">
            {monthItems.map((item) => (
              <div key={item.id} className="relative mb-3 last:mb-0">
                {/* Dot on the line */}
                <div className="absolute -left-6.5 top-1.5 h-2.5 w-2.5 rounded-full bg-green-500" />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {formatDay(item.completed_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
