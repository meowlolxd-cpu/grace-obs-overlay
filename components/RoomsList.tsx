import React from "react";

type Props = {
  rooms?: any[];
  onSelect?: (id: string) => void;
  onCreate?: () => void;
};

export default function RoomsList({ rooms = [], onSelect, onCreate }: Props) {
  return (
    <div className="p-4"> 
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Комнаты</h3>
        <button className="btn" onClick={onCreate}>Создать</button>
      </div>
      <ul className="space-y-2">
        {rooms.map((r: any) => (
          <li key={r.id} className="p-2 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => onSelect?.(r.id)}>
            {r.name || "Без названия"}
          </li>
        ))}
      </ul>
    </div>
  );
}
