import React from 'react'
import type { RoomElement, TextStyle } from '../types'

interface ElementEditorProps {
  element: RoomElement | null
  onUpdate: (id: string, changes: Partial<RoomElement>) => void
  onDelete: (id: string) => void
}

export default function ElementEditor({ element, onUpdate, onDelete }: ElementEditorProps) {
  if (!element) {
    return <div className="flex items-center justify-center h-full text-slate-400">Выберите элемент</div>
  }

  const updateStyle = (style: Partial<TextStyle>) => {
    onUpdate(element.id, {
      textStyle: { ...element.textStyle, ...style } as TextStyle,
    })
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{element.title}</h3>
          <p className="text-xs text-slate-400">{element.type}</p>
        </div>
        <button
          onClick={() => {
            onDelete(element.id)
          }}
          className="rounded px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white"
        >
          Удалить
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-slate-300">Название</label>
          <input
            type="text"
            value={element.title}
            onChange={(e) => onUpdate(element.id, { title: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={element.visible}
              onChange={(e) => onUpdate(element.id, { visible: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Видимый</span>
          </label>
        </div>

        {/* Position and Size */}
        <div>
          <label className="text-xs font-medium text-slate-300">Позиция X</label>
          <input
            type="number"
            value={Math.round(element.position.x)}
            onChange={(e) => onUpdate(element.id, { position: { ...element.position, x: Number(e.target.value) } })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">Позиция Y</label>
          <input
            type="number"
            value={Math.round(element.position.y)}
            onChange={(e) => onUpdate(element.id, { position: { ...element.position, y: Number(e.target.value) } })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">Ширина</label>
          <input
            type="number"
            value={Math.round(element.size.w)}
            onChange={(e) => onUpdate(element.id, { size: { ...element.size, w: Number(e.target.value) } })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">Высота</label>
          <input
            type="number"
            value={Math.round(element.size.h)}
            onChange={(e) => onUpdate(element.id, { size: { ...element.size, h: Number(e.target.value) } })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">Поворот (°)</label>
          <input
            type="number"
            value={Math.round(element.rotation)}
            onChange={(e) => onUpdate(element.id, { rotation: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Content (for text) */}
        {element.type === 'text' && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-300">Текст</label>
              <textarea
                value={element.content || ''}
                onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                rows={3}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Размер шрифта</label>
              <input
                type="number"
                value={element.textStyle?.fontSize || 16}
                onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Цвет</label>
              <input
                type="color"
                value={element.textStyle?.color || '#ffffff'}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateStyle({ fontWeight: element.textStyle?.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  element.textStyle?.fontWeight === 'bold' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                Ж
              </button>
              <button
                onClick={() => updateStyle({ fontStyle: element.textStyle?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`flex-1 rounded-xl px-3 py-2 text-sm italic transition ${
                  element.textStyle?.fontStyle === 'italic' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                К
              </button>
              <button
                onClick={() => updateStyle({ textDecoration: element.textStyle?.textDecoration === 'underline' ? 'none' : 'underline' })}
                className={`flex-1 rounded-xl px-3 py-2 text-sm underline transition ${
                  element.textStyle?.textDecoration === 'underline' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                П
              </button>
            </div>
          </>
        )}

        {/* Source URL (for image, video, youtube, sound) */}
        {(element.type === 'image' || element.type === 'video' || element.type === 'youtube' || element.type === 'sound') && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-300">
                {element.type === 'youtube' ? 'YouTube URL или ID' : 'Адрес файла'}
              </label>
              <input
                type="text"
                value={element.src || ''}
                onChange={(e) => onUpdate(element.id, { src: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </>
        )}

        {/* Audio controls */}
        {element.type === 'sound' && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-300">Громкость (0-1)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={element.volume || 0.5}
                onChange={(e) => onUpdate(element.id, { volume: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-slate-400">{Math.round((element.volume || 0.5) * 100)}%</div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Скорость (0.25-2)</label>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={element.playbackRate || 1}
                onChange={(e) => onUpdate(element.id, { playbackRate: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-slate-400">{(element.playbackRate || 1).toFixed(2)}x</div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={element.muted || false} onChange={(e) => onUpdate(element.id, { muted: e.target.checked })} className="rounded" />
              <span className="text-sm">Без звука</span>
            </label>
          </>
        )}

        {/* Video controls */}
        {element.type === 'video' && (
          <>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={element.chromaKey || false}
                onChange={(e) => onUpdate(element.id, { chromaKey: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Хромакей (зелёный экран)</span>
            </label>

            <div>
              <label className="text-xs font-medium text-slate-300">Громкость (0-1)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={element.volume || 0.5}
                onChange={(e) => onUpdate(element.id, { volume: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-slate-400">{Math.round((element.volume || 0.5) * 100)}%</div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Скорость (0.25-2)</label>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={element.playbackRate || 1}
                onChange={(e) => onUpdate(element.id, { playbackRate: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-slate-400">{(element.playbackRate || 1).toFixed(2)}x</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
