import React from "react";
import type { RoomElement, TextStyle } from "../types";

type Props = {
  selectedText?: RoomElement;
  textValue: string;
  textStyle: TextStyle;
  onChangeText: (value: string) => void;
  onUpdateTextStyle: (changes: Partial<TextStyle>) => void;
  onAddText: () => void;
  onUpdateText: () => void;
};

export default function TextSection({ selectedText, textValue, textStyle, onChangeText, onUpdateTextStyle, onAddText, onUpdateText }: Props) {
  const isEditing = selectedText?.type === 'text';

  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold">Текст</h4>
          <p className="text-sm text-slate-400">Добавляйте текст с форматированием, цветами и градиентами.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">text</span>
      </div>

      <textarea
        value={textValue}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Введите текст"
        className="mt-4 min-h-[120px] w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Шрифт</label>
          <select value={textStyle.fontFamily || 'Inter, sans-serif'} onChange={(e) => onUpdateTextStyle({ fontFamily: e.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-cyan-400">
            <option value="Inter, sans-serif">Inter</option>
            <option value="Montserrat, sans-serif">Montserrat</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Oswald, sans-serif">Oswald</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Размер</label>
          <input type="number" value={textStyle.fontSize || 32} onChange={(e) => onUpdateTextStyle({ fontSize: Number(e.target.value) })} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onUpdateTextStyle({ fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold' })} className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400">
          Жирный
        </button>
        <button type="button" onClick={() => onUpdateTextStyle({ fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic' })} className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400">
          Курсив
        </button>
        <button type="button" onClick={() => onUpdateTextStyle({ textDecoration: textStyle.textDecoration === 'underline' ? 'none' : 'underline' })} className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400">
          Подчеркнуть
        </button>
        <button type="button" onClick={() => onUpdateTextStyle({ textDecoration: textStyle.textDecoration === 'line-through' ? 'none' : 'line-through' })} className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400">
          Зачеркнуть
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          Цвет
          <input type="color" value={textStyle.color || '#ffffff'} onChange={(e) => onUpdateTextStyle({ color: e.target.value, gradient: '' })} className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900 p-1" />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          Градиент
          <input type="text" value={textStyle.gradient || ''} onChange={(e) => onUpdateTextStyle({ gradient: e.target.value })} placeholder="linear-gradient(90deg, #4ade80, #38bdf8)" className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={isEditing ? onUpdateText : onAddText} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          {isEditing ? 'Обновить текст' : 'Добавить текст'}
        </button>
      </div>
    </div>
  );
}
