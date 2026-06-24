import React from "react";
import type { RoomElement } from "../types";

type Props = {
  videos: RoomElement[];
  videoUrl: string;
  selectedId: string | null;
  onChangeUrl: (value: string) => void;
  onAddVideo: () => void;
  onUpdate: (id: string, changes: Partial<RoomElement>) => void;
  onSelect: (id: string) => void;
};

export default function VideoSection({ videos, videoUrl, selectedId, onChangeUrl, onAddVideo, onUpdate, onSelect }: Props) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold">Видео</h4>
          <p className="text-sm text-slate-400">Добавляйте видеофайлы или URL и включайте chroma key.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">video</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={videoUrl}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="URL видео"
          className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
        />
        <button onClick={onAddVideo} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Добавить видео
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => onSelect(video.id)}
            className={`group w-full rounded-3xl border p-4 text-left transition ${selectedId === video.id ? 'border-cyan-500 bg-slate-900' : 'border-slate-700 bg-slate-950/80 hover:border-slate-500'}`}>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">{video.title || 'Видео'}</div>
                <div className="text-xs text-slate-400">{video.src || 'Без ссылки'}</div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                  <span>{video.visible ? 'Видно' : 'Скрыто'}</span>
                  <span>{video.chromaKey ? 'Chroma key вкл.' : 'Chroma key выкл.'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(video.id, { chromaKey: !video.chromaKey });
                  }}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 transition hover:border-cyan-400"
                >
                  {video.chromaKey ? 'Откл. chroma' : 'Вкл. chroma'}
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-black">
              <video src={video.src} controls muted className="h-40 w-full object-cover" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
