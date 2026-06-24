import { motion } from 'framer-motion';
import type { RoomElement } from '../types';

type InspectorPanelProps = {
  element: RoomElement | null;
  onChange: (field: Partial<RoomElement>) => void;
};

export default function InspectorPanel({ element, onChange }: InspectorPanelProps) {
  if (!element) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-black/20"
      >
        <h2 className="text-lg font-semibold text-white">Свойства</h2>
        <p className="mt-4 text-sm text-slate-400">Выберите элемент, чтобы увидеть его настройки.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-black/20"
    >
      <h2 className="text-lg font-semibold text-white">Свойства элемента</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">X</label>
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={element.position.x}
            onChange={(event) => onChange({ position: { ...element.position, x: Number(event.target.value) } })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Y</label>
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={element.position.y}
            onChange={(event) => onChange({ position: { ...element.position, y: Number(event.target.value) } })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300">Ширина</label>
            <input
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={element.size.w}
              onChange={(event) => onChange({ size: { ...element.size, w: Number(event.target.value) } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Высота</label>
            <input
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={element.size.h}
              onChange={(event) => onChange({ size: { ...element.size, h: Number(event.target.value) } })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Поворот</label>
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={element.rotation}
            onChange={(event) => onChange({ rotation: Number(event.target.value) })}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <input
              type="checkbox"
              checked={element.visible}
              onChange={(event) => onChange({ visible: event.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
            />
            Видимый на оверлее
          </label>
        </div>
      </div>
    </motion.div>
  );
}
