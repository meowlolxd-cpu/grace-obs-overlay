import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import OverlayEditor from './components/OverlayEditor'
import ElementEditor from './components/ElementEditor'
import type { RoomElement } from './types'

type Room = { id: string; name: string }

const DEFAULT_ELEMENT_SIZE = { w: 360, h: 202 }

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [elements, setElements] = useState<RoomElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [newRoomName, setNewRoomName] = useState('Новая комната')
  const [uploading, setUploading] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; type?: 'info' | 'success' | 'error' }>>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  function showToast(text: string, type: 'info' | 'success' | 'error' = 'info') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((t) => [...t, { id, text, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  function getSupabaseErrorMessage(error: any, fallback: string) {
    const message = error?.message || error?.code || String(error)
    if (String(message).includes('Could not find the table')) {
      return `${fallback}: таблица не найдена. Проверьте, что таблица существует в Supabase.`
    }
    return `${fallback}: ${message}`
  }

  async function fetchRooms() {
    try {
      const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })
      if (error) {
        showToast(getSupabaseErrorMessage(error, 'Не удалось загрузить комнаты'), 'error')
        setRooms([])
        return
      }
      setRooms((data as any) || [])
      if (data && data.length && !selected) setSelected(data[0].id)
    } catch (err) {
      console.error('[App] fetchRooms error:', err)
      showToast('Ошибка подключения к Supabase', 'error')
    }
  }

  async function createRoom() {
    const { data, error } = await supabase.from('rooms').insert({ name: newRoomName }).select().single()
    if (error) {
      showToast(getSupabaseErrorMessage(error, 'Не удалось создать комнату'), 'error')
      return
    }
    setRooms((prev) => [data, ...prev])
    setSelected(data.id)
    setNewRoomName('Новая комната')
    showToast('Комната создана', 'success')
  }

  async function deleteRoom(roomId: string) {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId)
      if (error) {
        console.error('Delete error:', error)
        showToast(getSupabaseErrorMessage(error, 'Ошибка удаления комнаты'), 'error')
        return
      }
      setRooms((prev) => prev.filter((r) => r.id !== roomId))
      if (selected === roomId) {
        setSelected(null)
        setElements([])
      }
      showToast('Комната удалена', 'success')
    } catch (err) {
      console.error('Delete catch error:', err)
      showToast('Ошибка удаления', 'error')
    }
  }

  useEffect(() => {
    setElements([])
    setSelectedElementId(null)
  }, [selected])

  function createOverlayElement(type: RoomElement['type'], url?: string) {
    const baseElement: RoomElement = {
      id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title: type === 'text' ? 'Новый текст' : `${type[0].toUpperCase()}${type.slice(1)}`,
      content: type === 'text' ? 'Сюда ваш текст' : undefined,
      src: url,
      visible: true,
      position: { x: 80 + elements.length * 20, y: 80 + elements.length * 20 },
      size: { ...DEFAULT_ELEMENT_SIZE },
      rotation: 0,
      crop: { top: 0, right: 0, bottom: 0, left: 0 },
      textStyle: {
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#ffffff',
        textAlign: 'center',
      },
    }
    setElements((prev) => [...prev, baseElement])
    setSelectedElementId(baseElement.id)
  }

  function updateElement(id: string, changes: Partial<RoomElement>) {
    setElements((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  function deleteElement(id: string) {
    setElements((prev) => prev.filter((item) => item.id !== id))
    if (selectedElementId === id) setSelectedElementId(null)
  }

  function overlayLink(roomId: string) {
    return `./overlay/index.html?room=${roomId}`
  }

  function triggerFileInput(type: RoomElement['type']) {
    const accept = type === 'sound' ? 'audio/*' : type === 'video' ? 'video/*' : 'image/*'
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files?.[0]) {
        handleFileUpload(target, type)
      }
    }
    input.click()
  }

  async function handleFileUpload(input: HTMLInputElement, type: RoomElement['type']) {
    if (!selected) {
      showToast('Выберите комнату', 'error')
      return
    }

    const file = input.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const bucket = type === 'sound' ? 'audios' : type === 'video' ? 'videos' : 'images'
      const path = `${selected}/${Date.now()}_${file.name}`

      const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file)
      if (uploadErr) {
        console.error(`Upload error to ${bucket}:`, uploadErr)
        showToast(`Ошибка загрузки: bucket ${bucket} не найден. Создайте его в Supabase Storage.`, 'error')
        return
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      const publicUrl = (urlData as any)?.publicUrl
      if (!publicUrl) {
        throw new Error('Не удалось получить публичный URL файла')
      }

      createOverlayElement(type, publicUrl)
      showToast(`${type} загружен и добавлен`, 'success')
    } catch (err: any) {
      console.error('handleFileUpload error:', err)
      showToast(err.message || 'Ошибка загрузки', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Toasts container */}
        <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-2 rounded shadow-lg ${
                t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div className="text-sm">{t.text}</div>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-white opacity-80">
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex h-screen">
          {/* Left Panel - Rooms with toggle */}
          {sidebarOpen && (
            <div className="w-64 border-r border-slate-700 bg-slate-950 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h2 className="font-semibold mb-3">Комнаты</h2>
                <div className="space-y-2">
                  <input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Название комнаты"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={createRoom}
                    className="w-full rounded-2xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Создать
                  </button>
                </div>
              </div>

              {/* Rooms List */}
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`rounded-2xl p-3 transition cursor-pointer border ${
                      selected === room.id ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => setSelected(room.id)} className="flex-1 text-left text-sm font-medium truncate">
                        {room.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRoom(room.id)
                        }}
                        className="rounded px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    {selected === room.id && (
                      <div className="mt-2 text-xs text-cyan-300 break-all">
                        <a href={overlayLink(room.id)} target="_blank" rel="noreferrer" className="hover:underline">
                          Открыть оверлей
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-12 border-r border-slate-700 bg-slate-950 flex items-center justify-center hover:bg-slate-800 transition"
            title={sidebarOpen ? 'Скрыть комнаты' : 'Показать комнаты'}
          >
            <div className="text-xl">{sidebarOpen ? '◀' : '▶'}</div>
          </button>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            {selected && (
              <div className="border-b border-slate-700 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold">{rooms.find((r) => r.id === selected)?.name || 'Комната'}</h1>
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerFileInput('image')}
                      disabled={uploading}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-cyan-400 disabled:opacity-50"
                    >
                      📷 Изображение
                    </button>
                    <button
                      onClick={() => triggerFileInput('video')}
                      disabled={uploading}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-cyan-400 disabled:opacity-50"
                    >
                      🎬 Видео
                    </button>
                    <button
                      onClick={() => triggerFileInput('sound')}
                      disabled={uploading}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-cyan-400 disabled:opacity-50"
                    >
                      🔊 Звук
                    </button>
                    <button
                      onClick={() => createOverlayElement('youtube')}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-cyan-400"
                    >
                      📺 YouTube
                    </button>
                    <button
                      onClick={() => createOverlayElement('text')}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm hover:border-cyan-400"
                    >
                      📝 Текст
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex overflow-hidden">
              {/* Editor Canvas */}
              <div className="flex-1 bg-slate-800 p-4 overflow-auto">
                {selected ? (
                  <OverlayEditor elements={elements} selectedId={selectedElementId} onSelect={setSelectedElementId} onUpdate={updateElement} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">Выберите комнату слева</div>
                )}
              </div>

              {/* Right Panel - Element Editor */}
              <div className="w-72 border-l border-slate-700 bg-slate-950 flex flex-col overflow-hidden">
                <ElementEditor
                  element={elements.find((e) => e.id === selectedElementId) || null}
                  onUpdate={updateElement}
                  onDelete={deleteElement}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
