import { motion } from 'framer-motion';
import type { RoomElement } from '../types';

type CanvasViewProps = {
  elements: RoomElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const FRAME_RATIO = 1280 / 720;

export default function CanvasView({ elements, selectedId, onSelect }: CanvasViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl shadow-black/20"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full max-h-[780px] w-full max-w-[1400px] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/90">
          <div className="absolute inset-0 grid grid-rows-[1fr_0.5fr]">
            <div className="border-b border-dashed border-slate-700" />
            <div />
          </div>
          <div className="absolute inset-0 rounded-3xl p-4">
            {elements.map((element) => {
              const isSelected = selectedId === element.id;
              const opacity = element.visible ? 1 : 0.35;
              return (
                <button
                  key={element.id}
                  type="button"
                  onClick={() => onSelect(element.id)}
                  style={{
                    left: `${element.position.x}px`,
                    top: `${element.position.y}px`,
                    width: `${element.size.w}px`,
                    height: `${element.size.h}px`,
                    transform: `rotate(${element.rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                  className={`absolute overflow-hidden rounded-2xl border px-2 py-1 text-left transition ${isSelected ? 'border-cyan-400 bg-cyan-500/10' : 'border-transparent bg-white/5'} ${element.visible ? '' : 'opacity-30'}`}
                >
                  <div className="pointer-events-none h-full w-full">
                    {element.type === 'text' ? (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-white">{element.content || 'Text'}</div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-300">
                        {element.type}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
