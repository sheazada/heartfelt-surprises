import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { BirthdayExperience } from "@/components/experience/BirthdayExperience";
import { createBirthdayPage } from "@/lib/birthday/api";
import { validateImage } from "@/lib/birthday/images";
import {
  MAX_LETTER, MAX_PHOTOS, MAX_REASONS, THEMES, TRACKS,
  draftToExperience, emptyDraft, type BirthdayDraft,
} from "@/lib/birthday/types";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Birthday Surprise — Wishlight" },
      { name: "description", content: "Write reasons, add photos and a letter, then share a cinematic birthday surprise in minutes." },
      { property: "og:title", content: "Create a Birthday Surprise — Wishlight" },
      { property: "og:description", content: "Build a free personalized birthday surprise page in six simple steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatePage,
});

const STEP_TITLES = ["The basics", "Reasons you love them", "Memories", "A letter", "The experience", "Preview"];

const inputCls =
  "w-full rounded-lg border bg-transparent px-4 py-3 text-base outline-none transition focus:border-[var(--scene-accent)]";
const inputStyle = { borderColor: "color-mix(in oklab, var(--scene-fg) 22%, transparent)", color: "var(--scene-fg)" };

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm" style={{ color: "var(--scene-fg)" }}>
        {label}
        {hint ? <span className="text-xs" style={{ color: "var(--scene-soft)" }}>{hint}</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function CreatePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BirthdayDraft>(() => emptyDraft());
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<"recipientName" | "senderName" | "introMessage" | "age" | "reasons" | "letter", string>>>({});
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [submitError, setSubmitError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState("");

  const set = <K extends keyof BirthdayDraft>(k: K, v: BirthdayDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // Release object URLs on unmount.
  const photosRef = useRef(draft.photos);
  photosRef.current = draft.photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)), []);

  const validate = (s: number) => {
    const e: Partial<Record<"recipientName" | "senderName" | "introMessage" | "age" | "reasons" | "letter", string>> = {};
    if (s === 0) {
      if (!draft.recipientName.trim()) e.recipientName = "Who is this surprise for?";
      if (!draft.senderName.trim()) e.senderName = "Let them know who it's from.";
      if (!draft.introMessage.trim()) e.introMessage = "Write a short opening line.";
      if (draft.age && (Number(draft.age) < 1 || Number(draft.age) > 120)) e.age = "Enter an age between 1 and 120.";
    }
    if (s === 1 && !draft.reasons.some((r) => r.text.trim())) e.reasons = "Add at least one reason.";
    if (s === 3 && draft.letter.length > MAX_LETTER) e.letter = "Your letter is too long.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0 });
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setFileError("");
    const room = MAX_PHOTOS - draft.photos.length;
    const list = Array.from(files);
    const accepted = [];
    for (const f of list.slice(0, room)) {
      const err = validateImage(f);
      if (err) { setFileError(err); continue; }
      accepted.push({ id: crypto.randomUUID(), file: f, previewUrl: URL.createObjectURL(f), caption: "", memory: "" });
    }
    if (list.length > room) setFileError(`You can add up to ${MAX_PHOTOS} photos.`);
    set("photos", [...draft.photos, ...accepted]);
  };

  const movePhoto = (i: number, d: number) => {
    const arr = [...draft.photos];
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    set("photos", arr);
  };

  const generate = async () => {
    for (const s of [0, 1, 3]) if (!validate(s)) { setStep(s); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const id = await createBirthdayPage(draft, (p) => setProgress(p.step));
      navigate({ to: "/birthday/$id", params: { id }, search: { share: true } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (previewing) {
    return (
      <div className="relative">
        <button type="button" onClick={() => setPreviewing(false)} className="fixed left-3 top-3 z-[60] inline-flex min-h-10 items-center gap-1 rounded-full bg-background/80 px-4 text-sm text-foreground backdrop-blur safe-t">
          <X className="size-4" /> Close preview
        </button>
        <BirthdayExperience data={draftToExperience(draft)} />
      </div>
    );
  }

  return (
    <main className={`theme-${draft.theme} scene-surface min-h-[100svh] overflow-x-hidden`}>
      <div className="mx-auto max-w-xl px-5 pb-32 pt-8 safe-t">
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--scene-soft)" }}>
          <Link to="/" className="uppercase tracking-[0.35em]">Wishlight</Link>
          <span>Step {step + 1} of 6</span>
        </div>
        <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--scene-fg) 12%, transparent)" }}>
          <motion.div className="h-full" style={{ background: "var(--scene-accent)" }} animate={{ width: `${((step + 1) / 6) * 100}%` }} />
        </div>
        <h1 className="text-display mt-8 text-4xl" style={{ color: "var(--scene-fg)" }}>{STEP_TITLES[step]}</h1>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }} className="mt-8 space-y-5">
            {step === 0 && (
              <>
                <Field label="Their name" error={errors.recipientName}>
                  <input className={inputCls} style={inputStyle} value={draft.recipientName} maxLength={60} onChange={(e) => set("recipientName", e.target.value)} placeholder="Maya" />
                </Field>
                <Field label="Your name" error={errors.senderName}>
                  <input className={inputCls} style={inputStyle} value={draft.senderName} maxLength={60} onChange={(e) => set("senderName", e.target.value)} placeholder="Arjun" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Birthday">
                    <input type="date" className={inputCls} style={inputStyle} value={draft.birthdayDate} onChange={(e) => set("birthdayDate", e.target.value)} />
                  </Field>
                  <Field label="Age" hint="optional" error={errors.age}>
                    <input type="number" inputMode="numeric" min={1} max={120} className={inputCls} style={inputStyle} value={draft.age} onChange={(e) => set("age", e.target.value)} />
                  </Field>
                </div>
                <Field label="Relationship" hint="optional">
                  <input className={inputCls} style={inputStyle} value={draft.relationship} maxLength={40} onChange={(e) => set("relationship", e.target.value)} placeholder="Best friend, partner, sister…" />
                </Field>
                <Field label="Opening message" error={errors.introMessage} hint={`${draft.introMessage.length}/200`}>
                  <textarea rows={3} maxLength={200} className={inputCls} style={inputStyle} value={draft.introMessage} onChange={(e) => set("introMessage", e.target.value)} placeholder="Today is all about you." />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <p className="text-sm" style={{ color: "var(--scene-soft)" }}>Each reason becomes a balloon they pop. Up to {MAX_REASONS}.</p>
                {draft.reasons.map((r, i) => (
                  <div key={r.id} className="flex gap-2">
                    <input aria-label={`Reason ${i + 1}`} className={inputCls} style={inputStyle} maxLength={160} value={r.text} placeholder={`Reason ${i + 1}`}
                      onChange={(e) => set("reasons", draft.reasons.map((x) => (x.id === r.id ? { ...x, text: e.target.value } : x)))} />
                    {draft.reasons.length > 1 ? (
                      <button type="button" aria-label={`Remove reason ${i + 1}`} onClick={() => set("reasons", draft.reasons.filter((x) => x.id !== r.id))} className="flex size-12 shrink-0 items-center justify-center rounded-lg border" style={inputStyle}>
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
                {errors.reasons ? <p className="text-xs text-destructive">{errors.reasons}</p> : null}
                {draft.reasons.length < MAX_REASONS ? (
                  <button type="button" onClick={() => set("reasons", [...draft.reasons, { id: crypto.randomUUID(), text: "" }])} className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--scene-accent)" }}>
                    <Plus className="size-4" /> Add another reason
                  </button>
                ) : null}
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm" style={{ color: "var(--scene-soft)" }}>Optional. Up to {MAX_PHOTOS} photos — they're resized automatically.</p>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                {draft.photos.length < MAX_PHOTOS ? (
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-sm" style={inputStyle}>
                    <ImagePlus className="size-6" style={{ color: "var(--scene-accent)" }} />
                    Add photos ({draft.photos.length}/{MAX_PHOTOS})
                  </button>
                ) : null}
                {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
                {draft.photos.map((p, i) => (
                  <div key={p.id} className="flex gap-3 rounded-xl border p-3" style={inputStyle}>
                    <img src={p.previewUrl} alt="" className="size-20 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <input aria-label="Caption" className={`${inputCls} py-2 text-sm`} style={inputStyle} maxLength={60} placeholder="Caption" value={p.caption}
                        onChange={(e) => set("photos", draft.photos.map((x) => (x.id === p.id ? { ...x, caption: e.target.value } : x)))} />
                      <input aria-label="Short memory" className={`${inputCls} py-2 text-sm`} style={inputStyle} maxLength={160} placeholder="A short memory" value={p.memory}
                        onChange={(e) => set("photos", draft.photos.map((x) => (x.id === p.id ? { ...x, memory: e.target.value } : x)))} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => movePhoto(i, -1)} className="p-1.5 disabled:opacity-30"><ArrowUp className="size-4" /></button>
                      <button type="button" aria-label="Move down" disabled={i === draft.photos.length - 1} onClick={() => movePhoto(i, 1)} className="p-1.5 disabled:opacity-30"><ArrowDown className="size-4" /></button>
                      <button type="button" aria-label="Remove photo" onClick={() => { URL.revokeObjectURL(p.previewUrl); set("photos", draft.photos.filter((x) => x.id !== p.id)); }} className="p-1.5"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {step === 3 && (
              <Field label="Your letter" hint={`${draft.letter.length}/${MAX_LETTER}`} error={errors.letter}>
                <textarea rows={14} maxLength={MAX_LETTER} className={`${inputCls} text-hand text-2xl leading-snug`} style={inputStyle} value={draft.letter} onChange={(e) => set("letter", e.target.value)} placeholder={`Dear ${draft.recipientName || "you"},\n\n…`} />
              </Field>
            )}

            {step === 4 && (
              <>
                <p className="text-sm" style={{ color: "var(--scene-fg)" }}>Mood</p>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <button key={t.id} type="button" aria-pressed={draft.theme === t.id} onClick={() => set("theme", t.id)}
                      className={`theme-${t.id} scene-surface rounded-xl border-2 p-4 text-left transition`}
                      style={{ borderColor: draft.theme === t.id ? "var(--scene-accent)" : "transparent" }}>
                      <span className="text-display block text-xl" style={{ color: "var(--scene-fg)" }}>{t.label}</span>
                      <span className="text-xs" style={{ color: "var(--scene-soft)" }}>{t.hint}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-6 flex items-center justify-between text-sm" style={{ color: "var(--scene-fg)" }}>
                  Background music
                  <input type="checkbox" className="size-5 accent-[var(--scene-accent)]" checked={draft.musicEnabled} onChange={(e) => set("musicEnabled", e.target.checked)} />
                </label>
                {draft.musicEnabled ? (
                  <div className="grid gap-2">
                    {TRACKS.map((t) => (
                      <button key={t.id} type="button" aria-pressed={draft.musicTrack === t.id} onClick={() => set("musicTrack", t.id)} className="flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm"
                        style={{ ...inputStyle, borderColor: draft.musicTrack === t.id ? "var(--scene-accent)" : inputStyle.borderColor }}>
                        <span>{t.label}</span><span className="text-xs" style={{ color: "var(--scene-soft)" }}>{t.hint}</span>
                      </button>
                    ))}
                    <p className="text-xs" style={{ color: "var(--scene-soft)" }}>Original gentle melodies — it starts only after they tap to begin.</p>
                  </div>
                ) : null}
              </>
            )}

            {step === 5 && (
              <div className="text-center">
                <p className="text-display text-2xl" style={{ color: "var(--scene-fg)" }}>Your surprise is ready.</p>
                <p className="mt-2 text-sm" style={{ color: "var(--scene-soft)" }}>
                  For {draft.recipientName} · {draft.reasons.filter((r) => r.text.trim()).length} reasons · {draft.photos.length} photos · {draft.letter.trim() ? "a letter" : "no letter"}
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <button type="button" disabled={submitting} onClick={() => setPreviewing(true)} className="min-h-11 rounded-full border text-sm" style={inputStyle}>Watch the preview</button>
                  <button type="button" disabled={submitting} onClick={generate} className="min-h-11 rounded-full text-sm font-medium disabled:opacity-60" style={{ background: "var(--scene-accent)", color: "var(--scene-bg)" }}>
                    {submitting ? progress || "Working…" : "Generate Birthday Page"}
                  </button>
                  <button type="button" disabled={submitting} onClick={() => setStep(0)} className="text-sm underline-offset-4 hover:underline" style={{ color: "var(--scene-soft)" }}>Edit details</button>
                </div>
                {submitError ? <p role="alert" className="mt-4 text-sm text-destructive">{submitError}</p> : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {step < 5 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur-md safe-b" style={{ borderColor: "color-mix(in oklab, var(--scene-fg) 12%, transparent)", background: "color-mix(in oklab, var(--scene-bg) 80%, transparent)" }}>
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-5 py-3">
            <button type="button" onClick={goBack} disabled={step === 0} className="min-h-11 px-4 text-sm disabled:opacity-30" style={{ color: "var(--scene-fg)" }}>Back</button>
            <button type="button" onClick={goNext} className="min-h-11 rounded-full px-8 text-sm font-medium" style={{ background: "var(--scene-accent)", color: "var(--scene-bg)" }}>
              {step === 2 && draft.photos.length === 0 ? "Skip" : "Continue"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
