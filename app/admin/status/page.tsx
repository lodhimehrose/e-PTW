import { TrackByEmail } from "@/components/track-by-email";

export default function AdminStatusPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground">Track by email</h1>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Enter a contractor email to see every application they submitted, including people who used a different address from their sign-in.
      </p>
      <TrackByEmail />
    </div>
  );
}
