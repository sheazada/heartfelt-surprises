import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Check, Copy, ExternalLink } from "lucide-react";
import { fetchBirthday } from "@/lib/birthday/api";
import { BirthdayExperience } from "@/components/experience/BirthdayExperience";

const birthdayQuery = (id: string) =>
  queryOptions({ queryKey: ["birthday", id], queryFn: () => fetchBirthday(id), staleTime: 60_000 });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/birthday/$id")({
  validateSearch: z.object({ share: z.boolean().optional() }),
  loader: async ({ params, context }) => {
    if (!UUID.test(params.id)) throw notFound();
    const data = await context.queryClient.ensureQueryData(birthdayQuery(params.id));
    if (!data) throw notFound();
    return { name: data.recipientName };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `A birthday surprise for ${loaderData.name}` : "A birthday surprise" },
      { name: "description", content: "Someone made something special for you. Tap to begin." },
      { property: "og:title", content: loaderData ? `A birthday surprise for ${loaderData.name} ❤️` : "A birthday surprise" },
      { property: "og:description", content: "Someone made something special for you. Tap to begin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  pendingComponent: () => (
    <div className="theme-midnight scene-surface flex min-h-[100svh] items-center justify-center">
      <p className="text-display animate-pulse text-xl" style={{ color: "var(--scene-fg)" }}>Preparing your surprise…</p>
    </div>
  ),
  notFoundComponent: () => (
    <Message title="This surprise couldn't be found" body="The link may be incomplete. Ask the person who sent it to share it again." />
  ),
  errorComponent: ({ error }) => <Message title="This surprise didn't load" body={(error instanceof Error && error.message) || "Please check your connection and try again."} />,
  component: BirthdayPage,
});

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="theme-midnight scene-surface flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-display text-3xl" style={{ color: "var(--scene-fg)" }}>{title}</h1>
      <p className="mt-3 max-w-sm text-sm" style={{ color: "var(--scene-soft)" }}>{body}</p>
      <Link to="/" className="mt-8 text-sm underline" style={{ color: "var(--scene-fg)" }}>Go home</Link>
    </div>
  );
}

function BirthdayPage() {
  const { id } = Route.useParams();
  const { share } = Route.useSearch();
  const { data } = useSuspenseQuery(birthdayQuery(id));
  const [showShare, setShowShare] = useState(!!share);
  if (!data) return null;
  if (showShare) return <ShareScreen id={id} name={data.recipientName} theme={data.theme} onOpen={() => setShowShare(false)} />;
  return <BirthdayExperience data={data} />;
}

function ShareScreen({ id, name, theme, onOpen }: { id: string; name: string; theme: string; onOpen: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/birthday/${id}` : `/birthday/${id}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };
  return (
    <main className={`theme-${theme} scene-surface flex min-h-[100svh] flex-col items-center justify-center px-6 text-center safe-t safe-b`}>
      <p className="text-xs uppercase tracking-[0.35em]" style={{ color: "var(--scene-soft)" }}>It's ready</p>
      <h1 className="text-display mt-4 text-4xl sm:text-5xl" style={{ color: "var(--scene-fg)" }}>{name}'s surprise is live ❤️</h1>
      <p className="mt-3 max-w-sm text-sm" style={{ color: "color-mix(in oklab, var(--scene-fg) 70%, transparent)" }}>
        Send this link. Anyone with it can open the surprise.
      </p>
      <div className="mt-8 w-full max-w-md break-all rounded-xl border px-4 py-3 text-left text-sm" style={{ borderColor: "color-mix(in oklab, var(--scene-fg) 20%, transparent)", color: "var(--scene-fg)" }}>
        {url}
      </div>
      <div className="mt-6 flex w-full max-w-md flex-col gap-3">
        <button type="button" onClick={copy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-medium" style={{ background: "var(--scene-accent)", color: "var(--scene-bg)" }}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied!" : "Copy Link"}
        </button>
        <button type="button" onClick={onOpen} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border text-sm" style={{ borderColor: "color-mix(in oklab, var(--scene-fg) 30%, transparent)", color: "var(--scene-fg)" }}>
          <ExternalLink className="size-4" /> Open Birthday Page
        </button>
        <Link to="/create" className="mt-2 text-sm underline-offset-4 hover:underline" style={{ color: "var(--scene-soft)" }}>Create Another</Link>
      </div>
    </main>
  );
}
