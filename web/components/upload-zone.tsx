"use client";

import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  hint?: string;
};

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "application/octet-stream": [".npy", ".npz"],
};

export function UploadZone({
  multiple = false,
  disabled = false,
  onFiles,
  hint,
}: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    disabled,
    accept: ACCEPT,
    onDrop: (accepted: File[], _rejected: FileRejection[]) => {
      if (accepted.length) onFiles(accepted);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        "bg-muted/30 hover:bg-muted/60",
        isDragActive && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm font-medium">
        {isDragActive
          ? "Drop the file…"
          : multiple
            ? "Drop wafer maps here, or click to select"
            : "Drop a wafer map here, or click to select"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {hint ?? "PNG, JPG, WEBP, .npy, .npz"}
      </p>
    </div>
  );
}
