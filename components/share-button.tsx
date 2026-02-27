"use client";

import { useState } from "react";
import { useToast } from "./toast";

type Props = {
  title: string;
  url: string;
};

export default function ShareButton({ title, url }: Props) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  const shareText = `「${title}」を達成しました！ #人生100リスト`;
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  function handleXShare() {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast("リンクをコピーしました");
    } catch {
      showToast("コピーに失敗しました", "error");
    }
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
        title="シェア"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <button
              onClick={handleXShare}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Xでシェア
            </button>
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              リンクをコピー
            </button>
          </div>
        </>
      )}
    </div>
  );
}
