import { motion } from 'framer-motion';

type ToolbarProps = {
  roomName: string;
  overlayLink: string;
  controlLink: string;
  onCreateElement: (type: string) => void;
};

export default function Toolbar({ roomName, overlayLink, controlLink, onCreateElement }: ToolbarProps) {
  async function copyLink(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-black/20"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Комната</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{roomName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            onClick={() => copyLink(overlayLink)}
          >
            Копировать ссылку OBS
          </button>
          <button
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
            onClick={() => copyLink(controlLink)}
          >
            Копировать ссылку контроллера
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        <span>OBS: {overlayLink}</span>
        <span>Контроллер: {controlLink}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={() => onCreateElement('image')} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Добавить картинку</button>
        <button onClick={() => onCreateElement('video')} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Добавить видео</button>
        <button onClick={() => onCreateElement('youtube')} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Добавить YouTube</button>
        <button onClick={() => onCreateElement('text')} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Добавить текст</button>
      </div>
    </motion.div>
  );
}
