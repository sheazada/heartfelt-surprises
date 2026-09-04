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

export async function fetchBirthday(id: string): Promise<ExperienceData | null> {
  const { data: page, error } = await supabase
    .from("birthday_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!page) return null;

  const [reasonsRes, photosRes] = await Promise.all([
    supabase
      .from("birthday_reasons")
      .select("id, text, display_order")
      .eq("birthday_page_id", id)
      .order("display_order"),
    supabase
      .from("birthday_photos")
      .select("id, public_url, storage_path, caption, memory, display_order")
      .eq("birthday_page_id", id)
      .order("display_order"),
  ]);

  if (reasonsRes.error) throw new Error(reasonsRes.error.message);
  if (photosRes.error) throw new Error(photosRes.error.message);

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
    reasons: (reasonsRes.data ?? []).map((r) => ({ id: r.id, text: r.text })),
    photos: (photosRes.data ?? []).map((p) => ({
      id: p.id,
      url: p.public_url,
      caption: p.caption,
      memory: p.memory,
    })),
  };
}

export type ProgressUpdate = { step: string; current?: number; total?: number };

export async function createBirthdayPage(
  draft: BirthdayDraft,
  onProgress: (p: ProgressUpdate) => void = () => {},
): Promise<string> {
  onProgress({ step: "Creating your birthday page…" });

  const { data: page, error } = await supabase
    .from("birthday_pages")
    .insert({
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
    })
    .select("id")
    .single();

  if (error || !page) throw new Error(error?.message ?? "Could not create the birthday page.");
  const pageId = page.id;

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
