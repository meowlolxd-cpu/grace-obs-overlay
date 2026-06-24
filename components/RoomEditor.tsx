import React from "react";

type Props = {
  room?: any;
  onSave?: (room: any) => void;
  onDelete?: (id: string) => void;
};

export default function RoomEditor({ room, onSave, onDelete }: Props) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Редактор комнаты</h3>
      <div className="space-y-2">
        <input className="input" defaultValue={room?.name} placeholder="Название комнаты" />
        <textarea className="input" defaultValue={room?.description} placeholder="Описание" />
        <div className="flex gap-2">
          <button className="btn" onClick={() => onSave?.(room)}>Сохранить</button>
          <button className="btn btn-danger" onClick={() => onDelete?.(room?.id)}>Удалить</button>
        </div>
      </div>
    </div>
  );
}
