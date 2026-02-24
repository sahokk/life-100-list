"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./toast";
import Image from "next/image";

type ImageUploadProps = {
  uid: string;
  currentUrl: string | null;
  onUpload: (url: string) => void;
  folder: "avatars" | "items";
  size?: number;
};

export default function ImageUpload({
  uid,
  currentUrl,
  onUpload,
  folder,
  size = 96,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${uid}/${folder}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      showToast("画像のアップロードに失敗しました", "error");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    onUpload(publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {currentUrl ? (
        <Image
          src={currentUrl}
          alt="アップロード画像"
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-zinc-200 text-zinc-500 dark:bg-zinc-700"
          style={{ width: size, height: size }}
        >
          {folder === "avatars" ? "👤" : "📷"}
        </div>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
      >
        {uploading ? "アップロード中..." : "画像を変更"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
