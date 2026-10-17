import { PortalFrame } from "@/components/portal-frame";
import { requirePortalUser } from "@/lib/portal";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await requirePortalUser();
  return (
    <PortalFrame user={user} title="Your profile">
      <ProfileForm
        name={user.name === user.email ? "" : user.name}
        company={user.company}
        phone={user.phone}
        email={user.email}
        viewingAsAdmin={user.viewingAsAdmin}
      />
    </PortalFrame>
  );
}
