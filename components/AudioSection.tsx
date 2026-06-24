import React from "react";
import type { RoomElement } from "../types";

type Props = {
  audios: RoomElement[];
  soundUrl: string;
  selectedId: string | null;
  onChangeUrl: (value: string) => void;
  onAddSound: () => void;
  onUpdate: (id: string, changes: Partial<RoomElement>) => void;
  onSelect: (id: string) => void;
};

export default function AudioSection({ audios, soundUrl, selectedId, onChangeUrl, onAddSound, onUpdate, onSelect }: Props) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold">Звуки</h4>
          <p className="text-sm text-slate-400">Добавляйте аудио, регулируйте громкость и скорость.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">sound</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={soundUrl}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="URL звука"
          className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
        />
        <button onClick={onAddSound} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Добавить звук
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {audios.map((sound) => (
          <button
            key={sound.id}
            type="button"
            onClick={() => onSelect(sound.id)}
            className={`group w-full rounded-3xl border p-4 text-left transition ${selectedId === sound.id ? 'border-cyan-500 bg-slate-900' : 'border-slate-700 bg-slate-950/80 hover:border-slate-500'}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{sound.title || 'Звук'}</div>
                <div className="mt-1 text-xs text-slate-400">{sound.src || 'Без ссылки'}</div>
              </div>
              <div className="space-y-2 text-right">
                <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200">{sound.visible ? 'Включено' : 'Скрыто'}</div>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-300">
                Громкость
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sound.volume ?? 1}
                  onChange={(e) => onUpdate(sound.id, { volume: Number(e.target.value) })}
                  className="w-full"
                />
              </label>
              <label className="space-y-1 text-xs text-slate-300">
                Скорость
                <input
                  type="range"
                  min="0.25"
                  max="2"
                  step="0.05"
                  value={sound.playbackRate ?? 1}
                  onChange={(e) => onUpdate(sound.id, { playbackRate: Number(e.target.value) })}
                  className="w-full"
                />
              </label>
            </div>
            <div className="mt-3">
              <audio src={sound.src} controls className="w-full rounded-2xl bg-slate-900" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
