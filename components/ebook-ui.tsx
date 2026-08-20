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
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
      <div
        className={`h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-500 ${
          clamped > 0 && clamped < 100 ? "bar-live" : ""
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
