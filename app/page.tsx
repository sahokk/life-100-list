export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          人生でやりたいこと100
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          やりたいことリストを作成・管理・共有しよう
        </p>
      </main>
    </div>
  );
}
