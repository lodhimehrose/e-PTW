import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  draft: "bg-slate-200 text-slate-800",
  pending: "bg-amber-500 text-white",
  approved: "bg-green-600 text-white",
  approved_with_conditions: "bg-green-700 text-white",
  rejected: "bg-red-600 text-white",
  active: "bg-green-600 text-white",
  expired: "bg-slate-500 text-white",
  closed: "bg-slate-800 text-white",
  suspended: "bg-orange-600 text-white",
  cancelled: "bg-red-800 text-white",
};

export function StatusBadge({
  status,
  urgent,
}: {
  status: string;
  urgent?: boolean;
}) {
  return (
    <span className="inline-flex gap-1">
      {urgent && (
        <span className="rounded px-2 py-0.5 text-xs font-bold uppercase bg-red-600 text-white">
          Urgent
        </span>
      )}
      <span
        className={cn(
          "rounded px-2 py-0.5 text-xs font-semibold capitalize",
          styles[status] ?? "bg-gray-100",
        )}
      >
        {status.replace(/_/g, " ")}
      </span>
    </span>
  );
}
