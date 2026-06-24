import React from "react";

const DEFAULT_TTS_URL = "https://api.jeetbot.cc/voiceover/?token=ig85KT0UdCHka0FqhkXrwLRCbe25wvoMKfyspNGQDZS9IT1fZswp5_UXrr5iZCbT9wSVS40WDWg97l6WSWvndQ";

type Props = {
  ttsText: string;
  onChange: (text: string) => void;
  onCreateTts: () => void;
};

export default function TTSSection({ ttsText, onChange, onCreateTts }: Props) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold">TTS</h4>
          <p className="text-sm text-slate-400">Вставляйте текст и создавайте аудио через https://api.jeetbot.cc.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">tts</span>
      </div>

      <textarea
        value={ttsText}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Введите текст для озвучки"
        className="mt-4 min-h-[120px] w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
      />

      <button onClick={onCreateTts} className="mt-4 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
        Добавить TTS в оверлей
      </button>
    </div>
  );
}
