import React from "react";
import type { RoomElement } from "../types";

type Props = {
  images: RoomElement[];
  imageUrl: string;
  target: 'overlay' | 'background' | 'both';
  uploading: boolean;
  selectedId: string | null;
  onChangeUrl: (value: string) => void;
  onChangeTarget: (value: 'overlay' | 'background' | 'both') => void;
  onAddImage: () => void;
  onUploadFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
};

export default function ImageSection({
  images,
  imageUrl,
  target,
  uploading,
  selectedId,
  onChangeUrl,
  onChangeTarget,
  onAddImage,
  onUploadFile,
  onSelect,
  onToggleVisibility,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold">Картинки</h4>
            <p className="text-sm text-slate-400">Добавляйте изображения через URL или файл.</p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">overlay</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={imageUrl}
            onChange={(e) => onChangeUrl(e.target.value)}
            placeholder="URL картинки"
            className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          />
          <button onClick={onAddImage} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Добавить
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select value={target} onChange={(e) => onChangeTarget(e.target.value as any)} className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-cyan-400">
            <option value="overlay">Только OBS</option>
            <option value="background">Только фон</option>
            <option value="both">Оба</option>
          </select>
          <label className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 cursor-pointer hover:border-cyan-400">
            {uploading ? 'Загрузка...' : 'Загрузить файл'}
            <input type="file" accept="image/*" onChange={onUploadFile} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(image.id)}
            className={`group rounded-3xl border p-3 text-left transition ${selectedId === image.id ? 'border-cyan-500 bg-slate-900' : 'border-slate-700 bg-slate-950/80 hover:border-slate-500'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{image.title || 'Изображение'}</div>
                <div className="mt-1 text-xs text-slate-400">{image.src || 'Без ссылки'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(image.id);
                  }}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-100 transition hover:border-cyan-400"
                >
                  {image.visible ? 'Видно' : 'Скрыто'}
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
