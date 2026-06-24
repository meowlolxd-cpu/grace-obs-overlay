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

        const next = computeHandleDelta(handle, dx, dy, action.startElement);
        onUpdate(element.id, { position: { x: next.x, y: next.y }, size: { w: next.w, h: next.h } });
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
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Редактор оверлея</h2>
            <p className="mt-1 text-sm text-slate-400">Перетащите, измените размер, поверните и обрежьте элементы в режиме превью.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-300">shift = привязка / alt = обрезка</div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-4" style={{ minHeight: 540 }}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-80" />
          <div className="relative mx-auto h-full max-w-[1200px]" ref={containerRef}>
            <div className="relative mx-auto rounded-3xl border border-slate-700 bg-slate-950/30" style={{ width: '100%', paddingTop: '56.25%' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl border border-slate-600 bg-slate-950/20" />
                <div className="absolute inset-8 rounded-3xl border-4 border-cyan-500/60 bg-slate-900/60" />
              </div>
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
                      className={`absolute cursor-move rounded-2xl border p-1 transition ${isSelected ? 'border-cyan-400 bg-cyan-500/10 shadow-xl shadow-cyan-400/20' : 'border-transparent bg-slate-950/60'}`}
                      style={boxStyle}
                      onPointerDown={(event) => handleMoveStart(event, element)}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-xl" style={{ opacity: element.visible ? 1 : 0.35, clipPath: buildClip(element.crop) }}>
                        {element.type === 'image' && (
                          <img src={element.src} alt={element.title || 'Image'} className="h-full w-full object-cover" />
                        )}
                        {element.type === 'text' && (
                          <div className="flex h-full items-center justify-center p-4 text-center text-sm font-semibold text-white">
                            {element.content || 'Text'}
                          </div>
                        )}
                        {element.type === 'video' && (
                          <div className="flex h-full items-center justify-center bg-black text-white">Видео</div>
                        )}
                        {element.type === 'youtube' && (
                          <div className="flex h-full items-center justify-center bg-black text-white">YouTube</div>
                        )}
                        {element.type === 'sound' && (
                          <div className="flex h-full items-center justify-center bg-slate-800 text-slate-200">Аудио</div>
                        )}
                      </div>
                      {isSelected && (
                        <>
                          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 flex cursor-grab items-center gap-2">
                            <div className="h-0.5 w-14 bg-cyan-400/80" />
                            <div
                              onPointerDown={(event) => handleRotateStart(event, element)}
                              className="h-4 w-4 rounded-full border border-cyan-300 bg-cyan-500 shadow-lg shadow-cyan-500/30"
                            />
                          </div>
                          {handles.map((handle) => (
                            <button
                              key={handle.key}
                              type="button"
                              onPointerDown={(event) => handleResizeStart(event, element, handle.key)}
                              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 border border-white/20"
                              style={{ left: handle.left, top: handle.top }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
