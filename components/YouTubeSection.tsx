import React from "react";
import type { RoomElement } from "../types";

type Props = {
  videos: RoomElement[];
  youtubeUrl: string;
  selectedId: string | null;
  onChangeUrl: (value: string) => void;
  onAddYoutube: () => void;
  onUpdate: (id: string, changes: Partial<RoomElement>) => void;
  onSelect: (id: string) => void;
};

export default function YouTubeSection({ videos, youtubeUrl, selectedId, onChangeUrl, onAddYoutube, onUpdate, onSelect }: Props) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold">YouTube</h4>
          <p className="text-sm text-slate-400">Добавляйте YouTube-видео без стандартного интерфейса.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">youtube</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={youtubeUrl}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="Ссылка YouTube"
          className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
        />
        <button onClick={onAddYoutube} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Добавить YouTube
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => onSelect(video.id)}
            className={`group w-full rounded-3xl border p-4 text-left transition ${selectedId === video.id ? 'border-cyan-500 bg-slate-900' : 'border-slate-700 bg-slate-950/80 hover:border-slate-500'}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{video.title || 'YouTube'}</div>
                <div className="mt-1 text-xs text-slate-400">{video.src || 'Без ссылки'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(video.id, { visible: !video.visible });
                  }}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 transition hover:border-cyan-400"
                >
                  {video.visible ? 'Видно' : 'Скрыто'}
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-black">
              <div className="relative h-40 w-full">
                <iframe
                  src={video.src}
                  title={video.title || 'YouTube preview'}
                  className="h-full w-full"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
