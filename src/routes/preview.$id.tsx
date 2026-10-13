import { createFileRoute, redirect } from "@tanstack/react-router";

// Saved pages are previewed through the real public page; the unsaved draft
// preview lives inside the /create wizard.
export const Route = createFileRoute("/preview/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/birthday/$id", params: { id: params.id } });
  },
});
