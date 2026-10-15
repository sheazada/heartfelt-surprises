import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "./images";
import type { BirthdayDraft, ExperienceData, ThemeId, TrackId } from "./types";
import { THEMES, TRACKS } from "./types";

const BUCKET = "birthday-photos";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

function asTheme(value: string | null): ThemeId {
  const found = THEMES.find((t) => t.id === value);
  return (found?.id ?? "romantic") as ThemeId;
}

function asTrack(value: string | null): TrackId {
  const found = TRACKS.find((t) => t.id === value);
  return (found?.id ?? "aurora") as TrackId;
}

type RpcPage = {
  page: {
    id: string; recipient_name: string; sender_name: string; birthday_date: string | null;
    age: number | null; relationship: string | null; intro_message: string; letter: string;
    theme: string | null; music_enabled: boolean; music_track: string | null;
  };
  reasons: { id: string; text: string }[];
  photos: { id: string; public_url: string; caption: string | null; memory: string | null }[];
};

export async function fetchBirthday(id: string): Promise<ExperienceData | null> {
  const { data, error } = await supabase.rpc("get_birthday_page", { _id: id });
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { page, reasons, photos } = data as unknown as RpcPage;
  return {
    id: page.id,
    recipientName: page.recipient_name,
    senderName: page.sender_name,
    birthdayDate: page.birthday_date,
    age: page.age,
    relationship: page.relationship,
    introMessage: page.intro_message,
    letter: page.letter,
    theme: asTheme(page.theme),
    musicEnabled: page.music_enabled,
    musicTrack: asTrack(page.music_track),
    reasons: reasons.map((r) => ({ id: r.id, text: r.text })),
    photos: photos.map((p) => ({ id: p.id, url: p.public_url, caption: p.caption, memory: p.memory })),
  };
}

export type ProgressUpdate = { step: string; current?: number; total?: number };

export async function createBirthdayPage(
  draft: BirthdayDraft,
  onProgress: (p: ProgressUpdate) => void = () => {},
): Promise<string> {
  onProgress({ step: "Creating your birthday page…" });

  const pageId = crypto.randomUUID();
  const { error } = await supabase
    .from("birthday_pages")
    .insert({
      id: pageId,
      recipient_name: draft.recipientName.trim(),
      sender_name: draft.senderName.trim(),
      birthday_date: draft.birthdayDate || null,
      age: draft.age ? Number(draft.age) : null,
      relationship: draft.relationship.trim() || null,
      intro_message: draft.introMessage.trim(),
      letter: draft.letter,
      theme: draft.theme,
      music_enabled: draft.musicEnabled,
      music_track: draft.musicEnabled ? draft.musicTrack : null,
    });

  if (error) throw new Error(error.message || "Could not create the birthday page.");

  const reasons = draft.reasons.filter((r) => r.text.trim());
  if (reasons.length) {
    onProgress({ step: "Saving your reasons…" });
    const { error: reasonError } = await supabase.from("birthday_reasons").insert(
      reasons.map((r, index) => ({
        birthday_page_id: pageId,
        text: r.text.trim(),
        display_order: index,
      })),
    );
    if (reasonError) throw new Error(`Reasons could not be saved: ${reasonError.message}`);
  }

  for (let index = 0; index < draft.photos.length; index++) {
    const photo = draft.photos[index]!;
    onProgress({
      step: `Uploading photo ${index + 1} of ${draft.photos.length}…`,
      current: index + 1,
      total: draft.photos.length,
    });

    const compressed = await compressImage(photo.file);
    const extension = compressed.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${pageId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, { contentType: compressed.type, upsert: false });

    if (uploadError) {
      throw new Error(`Photo ${index + 1} ("${photo.file.name}") failed: ${uploadError.message}`);
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);

    if (signError || !signed?.signedUrl) {
      throw new Error(
        `Photo ${index + 1} ("${photo.file.name}") uploaded but could not be linked: ${signError?.message ?? "unknown error"}`,
      );
    }

    const { error: rowError } = await supabase.from("birthday_photos").insert({
      birthday_page_id: pageId,
      storage_path: path,
      public_url: signed.signedUrl,
      caption: photo.caption.trim() || null,
      memory: photo.memory.trim() || null,
      display_order: index,
    });

    if (rowError) {
      throw new Error(`Photo ${index + 1} could not be saved: ${rowError.message}`);
    }
  }

  onProgress({ step: "Finishing up…" });
  return pageId;
}
