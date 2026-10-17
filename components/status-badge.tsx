import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  draft: "bg-slate-200 text-slate-800",
  approved: "bg-green-100 text-green-900",
  approved_with_conditions: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-900",
  active: "bg-blue-100 text-blue-900",
  expired: "bg-gray-100 text-gray-700",
  closed: "bg-slate-800 text-white",
  suspended: "bg-orange-100 text-orange-900",
  cancelled: "bg-gray-200 text-gray-800",
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
          "rounded px-2 py-0.5 text-xs font-medium capitalize",
          styles[status] ?? "bg-gray-100",
        )}
      >
        {status.replace(/_/g, " ")}
      </span>
    </span>
  );
}
