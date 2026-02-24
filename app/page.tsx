export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          人生でやりたいこと100
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          やりたいことリストを作成・管理・共有しよう
        </p>
      </div>
    </div>
  );
}
