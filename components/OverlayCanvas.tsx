import React from "react";

// Canvas отображения слоёв оверлея
export default function OverlayCanvas() {
  return (
    <div className="relative bg-gray-900/20 flex items-center justify-center" style={{ width: '100%', height: 360 }}>
      <div className="bg-black text-white p-2 rounded">Overlay 16:9 preview</div>
      <div className="absolute" style={{ inset: 0 }}>
        {/* Здесь будут рендериться слои: изображения, видео, текст */}
      </div>
    </div>
  );
}
