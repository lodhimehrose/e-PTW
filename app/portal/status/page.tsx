import { PortalFrame } from "@/components/portal-frame";
import { TrackByEmail } from "@/components/track-by-email";
import { requirePortalUser } from "@/lib/portal";

export default async function PortalStatusPage() {
  const user = await requirePortalUser();
  return (
    <PortalFrame user={user} title="Track by email">
      <p className="mb-4 text-sm text-muted-foreground">
        Enter the email used on the form. Every matching application and its current status will appear below.
      </p>
      <TrackByEmail defaultEmail={user.email} />
    </PortalFrame>
  );
}
