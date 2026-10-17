import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DateRangeFilter({
  from,
  to,
  hidden = [],
  clearHref,
}: {
  from?: string;
  to?: string;
  hidden?: { name: string; value: string }[];
  clearHref: string;
}) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      {hidden
        .filter((field) => field.value)
        .map((field) => (
          <input key={field.name} type="hidden" name={field.name} value={field.value} />
        ))}
      <div>
        <label htmlFor="from" className="mb-1 block text-xs font-medium text-muted-foreground">
          From
        </label>
        <input
          id="from"
          type="date"
          name="from"
          defaultValue={from}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div>
        <label htmlFor="to" className="mb-1 block text-xs font-medium text-muted-foreground">
          To
        </label>
        <input
          id="to"
          type="date"
          name="to"
          defaultValue={to}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <Button type="submit" size="sm">
        Filter
      </Button>
      <Link href={clearHref} className="pb-2 text-sm underline">
        Clear dates
      </Link>
    </form>
  );
}
