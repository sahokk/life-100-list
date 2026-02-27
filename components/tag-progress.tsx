"use client";

type TagStat = {
  name: string;
  completed: number;
  total: number;
};

type Props = {
  stats: TagStat[];
};

export default function TagProgress({ stats }: Props) {
  if (stats.length === 0) {
    return (
      <p className="text-sm text-zinc-500">タグ付きアイテムがありません</p>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((stat) => {
        const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
        return (
          <div key={stat.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{stat.name}</span>
              <span className="text-zinc-500">
                {stat.completed} / {stat.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
