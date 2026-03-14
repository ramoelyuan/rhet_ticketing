import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500 dark:text-gray-400">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" aria-hidden />
      <p className="text-sm font-medium">Loading...</p>
    </div>
  );
}
