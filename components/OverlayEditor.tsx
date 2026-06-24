import React from 'react';
import type { RoomElement } from '../types';

type Props = {
  elements: RoomElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, changes: Partial<RoomElement>) => void;
};

type ActionType = 'move' | 'resize' | 'rotate';

type ActiveAction = {
  type: ActionType;
  elementId: string;
  handle?: string;
  startPointer: { x: number; y: number };
  startElement: RoomElement;
  startAngle?: number;
  shiftKey: boolean;
  altKey: boolean;
};

const handles = [
  { key: 'nw', left: '0%', top: '0%' },
  { key: 'ne', left: '100%', top: '0%' },
  { key: 'sw', left: '0%', top: '100%' },
  { key: 'se', left: '100%', top: '100%' },
  { key: 'n', left: '50%', top: '0%' },
  { key: 's', left: '50%', top: '100%' },
  { key: 'w', left: '0%', top: '50%' },
  { key: 'e', left: '100%', top: '50%' },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function computeHandleDelta(handle: string, dx: number, dy: number, start: RoomElement) {
  let next = { ...start.size, ...start.position };
  const minSize = 50;
  const deltaX = handle.includes('w') ? -dx : handle.includes('e') ? dx : 0;
  const deltaY = handle.includes('n') ? -dy : handle.includes('s') ? dy : 0;

  if (handle.includes('w')) {
    next.w = clamp(start.size.w + deltaX, minSize, 2000);
    next.x = start.position.x + dx;
  }
  if (handle.includes('e')) {
    next.w = clamp(start.size.w + deltaX, minSize, 2000);
  }
  if (handle.includes('n')) {
    next.h = clamp(start.size.h + deltaY, minSize, 2000);
    next.y = start.position.y + dy;
  }
  if (handle.includes('s')) {
    next.h = clamp(start.size.h + deltaY, minSize, 2000);
  }

  return next;
}

function buildClip(crop: RoomElement['crop']) {
  if (!crop) return undefined;
  return `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`;
}

export default function OverlayEditor({ elements, selectedId, onSelect, onUpdate }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const actionRef = React.useRef<ActiveAction | null>(null);

  function getPointerPosition(event: React.PointerEvent) {
    return { x: event.clientX, y: event.clientY };
  }

  function beginAction(action: ActiveAction) {
    actionRef.current = action;
  }

  function stopAction() {
    actionRef.current = null;
  }

  React.useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const action = actionRef.current;
      if (!action) return;
      event.preventDefault();

      const pointer = { x: event.clientX, y: event.clientY };
      const dx = pointer.x - action.startPointer.x;
      const dy = pointer.y - action.startPointer.y;
      const element = action.startElement;
      const shift = action.shiftKey || event.shiftKey;
      const alt = action.altKey || event.altKey;

      if (action.type === 'move') {
        const nextX = element.position.x + dx;
        const nextY = element.position.y + dy;
        onUpdate(element.id, { position: { x: nextX, y: nextY } });
        return;
      }

      if (action.type === 'rotate') {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + element.position.x + element.size.w / 2;
        const centerY = rect.top + element.position.y + element.size.h / 2;
        const currentAngle = Math.atan2(pointer.y - centerY, pointer.x - centerX) * (180 / Math.PI);
        const diff = currentAngle - (action.startAngle ?? currentAngle);
        let next = element.rotation + diff;
        if (shift) next = Math.round(next / 15) * 15;
        onUpdate(element.id, { rotation: next });
        return;
      }

      if (action.type === 'resize') {
        const handle = action.handle;
        if (!handle) return;

        if (alt) {
          // Alt + drag = crop
          const percentX = (dx / element.size.w) * 100;
          const percentY = (dy / element.size.h) * 100;
          const crop = {
            top: clamp((element.crop?.top ?? 0) + (handle.includes('n') ? percentY : handle.includes('s') ? -percentY : 0), 0, 90),
            bottom: clamp((element.crop?.bottom ?? 0) + (handle.includes('s') ? -percentY : handle.includes('n') ? percentY : 0), 0, 90),
            left: clamp((element.crop?.left ?? 0) + (handle.includes('w') ? percentX : handle.includes('e') ? -percentX : 0), 0, 90),
            right: clamp((element.crop?.right ?? 0) + (handle.includes('e') ? -percentX : handle.includes('w') ? percentX : 0), 0, 90),
          };
          onUpdate(element.id, { crop });
          return;
        }

        if (shift) {
          // Shift + drag = stretch from handle (proportional resize)
          const next = computeHandleDelta(handle, dx, dy, action.startElement);
          onUpdate(element.id, { position: { x: next.x, y: next.y }, size: { w: next.w, h: next.h } });
        } else {
          // Normal drag = resize
          const next = computeHandleDelta(handle, dx, dy, action.startElement);
          onUpdate(element.id, { position: { x: next.x, y: next.y }, size: { w: next.w, h: next.h } });
        }
      }
    }

    function onPointerUp() {
      stopAction();
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onUpdate]);

  function handleMoveStart(event: React.PointerEvent, element: RoomElement) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(element.id);
    beginAction({
      type: 'move',
      elementId: element.id,
      startPointer: getPointerPosition(event),
      startElement: element,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });
  }

  function handleResizeStart(event: React.PointerEvent, element: RoomElement, handle: string) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(element.id);
    beginAction({
      type: 'resize',
      elementId: element.id,
      handle,
      startPointer: getPointerPosition(event),
      startElement: element,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });
  }

  function handleRotateStart(event: React.PointerEvent, element: RoomElement) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(element.id);
    const container = containerRef.current;
    const rect = container?.getBoundingClientRect();
    const centerX = rect ? rect.left + element.position.x + element.size.w / 2 : 0;
    const centerY = rect ? rect.top + element.position.y + element.size.h / 2 : 0;
    const startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
    beginAction({
      type: 'rotate',
      elementId: element.id,
      startPointer: getPointerPosition(event),
      startElement: element,
      startAngle,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Редактор оверлея</h2>
        <p className="mt-1 text-sm text-slate-400">Перетащите, измените размер (Shift = растяжение), поверните, обрежьте (Alt). Убирайте картинки за экран!</p>
      </div>

      {/* Two overlapping screens */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        {/* Background Screen - Big 16:9 (z-index lower) */}
        <div className="absolute inset-0 rounded-2xl border-2 border-slate-500 bg-slate-950" style={{ aspectRatio: '16/9' }}>
          <div className="absolute inset-0">
            {elements.map((element) => {
              const isSelected = selectedId === element.id;
              const boxStyle: React.CSSProperties = {
                left: element.position.x,
                top: element.position.y,
                width: element.size.w,
                height: element.size.h,
                transform: `rotate(${element.rotation}deg)`,
                transformOrigin: 'center',
              };
              return (
                <div
                  key={element.id}
                  className={`absolute cursor-move rounded-lg border p-1 transition ${
                    isSelected ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-400/30' : 'border-slate-700 hover:border-slate-500'
                  }`}
                  style={boxStyle}
                  onPointerDown={(event) => handleMoveStart(event, element)}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-md" style={{ opacity: element.visible ? 1 : 0.3, clipPath: buildClip(element.crop) }}>
                    {element.type === 'image' && <img src={element.src} alt={element.title || 'Image'} className="h-full w-full object-cover" />}
                    {element.type === 'text' && (
                      <div
                        className="flex h-full items-center justify-center p-2 text-center"
                        style={{
                          fontSize: element.textStyle?.fontSize || 16,
                          fontWeight: element.textStyle?.fontWeight || 'normal',
                          fontStyle: element.textStyle?.fontStyle || 'normal',
                          textDecoration: element.textStyle?.textDecoration || 'none',
                          color: element.textStyle?.color || '#ffffff',
                          fontFamily: element.textStyle?.fontFamily || 'Inter',
                        }}
                      >
                        {element.content || 'Text'}
                      </div>
                    )}
                    {element.type === 'video' && <div className="flex h-full items-center justify-center bg-black text-white text-sm">Видео</div>}
                    {element.type === 'youtube' && <div className="flex h-full items-center justify-center bg-black text-white text-sm">YouTube</div>}
                    {element.type === 'sound' && <div className="flex h-full items-center justify-center bg-slate-800 text-slate-200 text-sm">🔊 Звук</div>}
                  </div>
                  {isSelected && (
                    <>
                      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 flex cursor-grab items-center gap-2">
                        <div className="h-0.5 w-12 bg-cyan-400" />
                        <div
                          onPointerDown={(event) => handleRotateStart(event, element)}
                          className="h-3 w-3 rounded-full border border-cyan-300 bg-cyan-500"
                        />
                      </div>
                      {handles.map((handle) => (
                        <button
                          key={handle.key}
                          type="button"
                          onPointerDown={(event) => handleResizeStart(event, element, handle.key)}
                          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 border border-white/20"
                          style={{ left: handle.left, top: handle.top }}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-slate-400">Основной оверлей (16:9)</div>
        </div>

        {/* Foreground Screen - Small 16:9 (z-index higher) - overlay on top */}
        <div
          className="absolute rounded-2xl border-2 border-cyan-500 bg-slate-950/80 backdrop-blur-sm"
          style={{
            aspectRatio: '16/9',
            bottom: '2rem',
            right: '2rem',
            width: '30%',
            zIndex: 10,
          }}
        >
          <div className="absolute inset-0">
            {elements.map((element) => {
              if (!element.visible) return null;
              const boxStyle: React.CSSProperties = {
                left: element.position.x,
                top: element.position.y,
                width: element.size.w,
                height: element.size.h,
                transform: `rotate(${element.rotation}deg)`,
                transformOrigin: 'center',
                pointerEvents: 'none',
              };
              return (
                <div key={element.id} className="absolute" style={boxStyle}>
                  <div className="relative h-full w-full overflow-hidden rounded-sm" style={{ clipPath: buildClip(element.crop) }}>
                    {element.type === 'image' && <img src={element.src} alt={element.title || 'Image'} className="h-full w-full object-cover" />}
                    {element.type === 'text' && (
                      <div
                        className="flex h-full items-center justify-center p-1 text-center"
                        style={{
                          fontSize: (element.textStyle?.fontSize || 16) * 0.6,
                          fontWeight: element.textStyle?.fontWeight || 'normal',
                          fontStyle: element.textStyle?.fontStyle || 'normal',
                          textDecoration: element.textStyle?.textDecoration || 'none',
                          color: element.textStyle?.color || '#ffffff',
                          fontFamily: element.textStyle?.fontFamily || 'Inter',
                        }}
                      >
                        {element.content || 'Text'}
                      </div>
                    )}
                    {element.type === 'video' && <div className="flex h-full items-center justify-center bg-black" />}
                    {element.type === 'youtube' && <div className="flex h-full items-center justify-center bg-black" />}
                    {element.type === 'sound' && <div className="flex h-full items-center justify-center bg-slate-800" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-1 left-2 text-xs text-cyan-300">Превью (16:9)</div>
        </div>
      </div>
    </div>
  );
}
