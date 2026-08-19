import type { EbookStatus } from "@/lib/types";
import { STATUS_CLASSES, STATUS_LABEL } from "@/lib/ebook-format";

export function StatusBadge({ status }: { status: EbookStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
      <div
        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
