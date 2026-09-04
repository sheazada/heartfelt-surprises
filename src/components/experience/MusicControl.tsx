import { Music, Pause, Play, VolumeX, Volume2 } from "lucide-react";

type Props = {
  playing: boolean;
  muted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onToggleMute: () => void;
};

export function MusicControl({ playing, muted, onPlay, onPause, onToggleMute }: Props) {
  return (
    <div
      className="fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-md safe-t"
      style={{
        borderColor: "color-mix(in oklab, var(--scene-fg) 18%, transparent)",
        background: "color-mix(in oklab, var(--scene-bg) 70%, transparent)",
        color: "var(--scene-fg)",
      }}
    >
      <Music className="mx-1 size-3.5 opacity-60" aria-hidden />
      <button
        type="button"
        onClick={playing ? onPause : onPlay}
        aria-label={playing ? "Pause music" : "Play music"}
        className="flex size-8 items-center justify-center rounded-full transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-1"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "Unmute music" : "Mute music"}
        aria-pressed={muted}
        className="flex size-8 items-center justify-center rounded-full transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-1"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}
