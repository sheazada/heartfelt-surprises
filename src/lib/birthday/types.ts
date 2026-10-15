export const THEMES = [
  { id: "romantic", label: "Romantic", hint: "Warm rose light, candle glow" },
  { id: "dreamy", label: "Dreamy", hint: "Soft lilac haze, floating stars" },
  { id: "midnight", label: "Midnight", hint: "Deep blue, quiet and cinematic" },
  { id: "celebration", label: "Celebration", hint: "Golden amber, festive sparkle" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

/** Built-in ambient tracks are generated with the Web Audio API — no licensed recordings. */
export const TRACKS = [
  { id: "aurora", label: "Aurora", hint: "Slow warm pads" },
  { id: "musicbox", label: "Music Box", hint: "Gentle bell melody" },
  { id: "lantern", label: "Lantern", hint: "Sparse piano-like tones" },
  { id: "birthday", label: "Happy Birthday", hint: "The classic tune, softly" },
  { id: "sunrise", label: "Sunrise", hint: "Bright, cheerful arpeggios" },
  { id: "starlight", label: "Starlight", hint: "Twinkling high chimes" },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

export type DraftPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  memory: string;
};

export type DraftReason = { id: string; text: string };

export type BirthdayDraft = {
  recipientName: string;
  senderName: string;
  birthdayDate: string;
  age: string;
  relationship: string;
  introMessage: string;
  reasons: DraftReason[];
  photos: DraftPhoto[];
  letter: string;
  theme: ThemeId;
  musicEnabled: boolean;
  musicTrack: TrackId;
};

export type BirthdayPageRow = {
  id: string;
  recipient_name: string;
  sender_name: string;
  birthday_date: string | null;
  age: number | null;
  relationship: string | null;
  intro_message: string;
  letter: string;
  theme: string;
  music_enabled: boolean;
  music_track: string | null;
  created_at: string;
};

export type ExperienceReason = { id: string; text: string };
export type ExperiencePhoto = {
  id: string;
  url: string;
  caption: string | null;
  memory: string | null;
};

export type ExperienceData = {
  id: string;
  recipientName: string;
  senderName: string;
  birthdayDate: string | null;
  age: number | null;
  relationship: string | null;
  introMessage: string;
  letter: string;
  theme: ThemeId;
  musicEnabled: boolean;
  musicTrack: TrackId;
  reasons: ExperienceReason[];
  photos: ExperiencePhoto[];
};

export const MAX_REASONS = 12;
export const MAX_PHOTOS = 10;
export const MAX_LETTER = 3000;

export function emptyDraft(): BirthdayDraft {
  return {
    recipientName: "",
    senderName: "",
    birthdayDate: "",
    age: "",
    relationship: "",
    introMessage: "",
    reasons: [{ id: crypto.randomUUID(), text: "" }],
    photos: [],
    letter: "",
    theme: "romantic",
    musicEnabled: true,
    musicTrack: "aurora",
  };
}

export function draftToExperience(draft: BirthdayDraft, id = "preview"): ExperienceData {
  return {
    id,
    recipientName: draft.recipientName.trim() || "Friend",
    senderName: draft.senderName.trim() || "Someone who loves you",
    birthdayDate: draft.birthdayDate || null,
    age: draft.age ? Number(draft.age) : null,
    relationship: draft.relationship.trim() || null,
    introMessage: draft.introMessage.trim(),
    letter: draft.letter,
    theme: draft.theme,
    musicEnabled: draft.musicEnabled,
    musicTrack: draft.musicTrack,
    reasons: draft.reasons
      .filter((r) => r.text.trim())
      .map((r) => ({ id: r.id, text: r.text.trim() })),
    photos: draft.photos.map((p) => ({
      id: p.id,
      url: p.previewUrl,
      caption: p.caption.trim() || null,
      memory: p.memory.trim() || null,
    })),
  };
}
