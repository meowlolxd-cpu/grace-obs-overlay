import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import OverlayEditor from './components/OverlayEditor'
import type { RoomElement } from './types'

type Room = { id: string; name: string }
type Source = { id: string; type: string; properties: any }

const DEFAULT_ELEMENT_SIZE = { w: 360, h: 202 }

export default function App(){  console.log('[App] Initializing...')
    const [rooms, setRooms] = useState<Room[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [elements, setElements] = useState<RoomElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [newRoomName, setNewRoomName] = useState('Новая комната')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [target, setTarget] = useState<'overlay'|'background'|'both'>('overlay')
  const [toasts, setToasts] = useState<Array<{id:number,text:string,type?:'info'|'success'|'error'}>>([])
  const [menuOpen, setMenuOpen] = useState(true)

  function showToast(text: string, type: 'info'|'success'|'error' = 'info'){
    const id = Date.now() + Math.floor(Math.random()*1000)
    setToasts(t => [...t, { id, text, type }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id!==id)), 4000)
  }

  useEffect(()=>{
    console.log('[App] useEffect: fetchRooms')
    try {
      fetchRooms()
    } catch (err) {
      console.error('[App] Error in fetchRooms:', err)
    }
  }, [])

  function getSupabaseErrorMessage(error: any, fallback: string){
    const message = error?.message || error?.code || String(error)
    if (String(message).includes('Could not find the table')) {
      return `${fallback}: таблица не найдена. Проверьте, что таблица существует в Supabase и что схема public доступна.`
    }
    return `${fallback}: ${message}`
  }

  async function fetchRooms(){
    console.log('[App] fetchRooms start')
    try {
      const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })
      console.log('[App] fetchRooms response:', { data, error })
      if (error) {
        showToast(getSupabaseErrorMessage(error, 'Не удалось загрузить комнаты'),'error')
        setRooms([])
        return
      }
      setRooms((data as any) || [])
      if(data && data.length && !selected) setSelected(data[0].id)
    } catch (err) {
      console.error('[App] fetchRooms error:', err)
      showToast('Ошибка подключения к Supabase', 'error')
    }
  }

  async function createRoom(){
    const { data, error } = await supabase.from('rooms').insert({ name: newRoomName }).select().single()
    if (error) { showToast(getSupabaseErrorMessage(error, 'Не удалось создать комнату'),'error'); return }
    setRooms(prev => [data, ...prev])
    setSelected(data.id)
    showToast('Комната создана','success')
  }

  async function deleteRoom(roomId: string){
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)
    if(error) {
      showToast(getSupabaseErrorMessage(error, 'Ошибка удаления комнаты'),'error')
      return
    }
    setRooms(prev => prev.filter(r=>r.id!==roomId))
    if(selected === roomId) {
      setSelected(null)
      setSources([])
    }
    showToast('Комната удалена','success')
  }

  async function loadSources(roomId: string|null){
    if(!roomId) return setSources([])
    const { data, error } = await supabase.from('sources').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
    if (error) {
      showToast(getSupabaseErrorMessage(error, 'Не удалось загрузить источники'),'error')
      return
    }
    setSources((data as any) || [])
  }

  async function deleteSource(sourceId: string){
    const { error } = await supabase.from('sources').delete().eq('id', sourceId)
    if(error) {
      showToast(getSupabaseErrorMessage(error, 'Ошибка удаления источника'),'error')
      return
    }
    setSources(prev => prev.filter(s=>s.id!==sourceId))
    showToast('Источник удалён','success')
  }

  useEffect(()=>{ loadSources(selected) }, [selected])

  useEffect(() => {
    setElements([])
    setSelectedElementId(null)
  }, [selected])

  function createOverlayElement(type: RoomElement['type']) {
    const baseElement: RoomElement = {
      id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title: type === 'text' ? 'Новый текст' : `${type[0].toUpperCase()}${type.slice(1)}`,
      content: type === 'text' ? 'Сюда ваш текст' : undefined,
      src:
        type === 'image'
          ? 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80'
          : type === 'video'
          ? 'https://www.w3schools.com/html/mov_bbb.mp4'
          : type === 'youtube'
          ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          : type === 'sound'
          ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
          : undefined,
      visible: true,
      position: {
        x: 80 + elements.length * 20,
        y: 80 + elements.length * 20,
      },
      size: { ...DEFAULT_ELEMENT_SIZE },
      rotation: 0,
      crop: { top: 0, right: 0, bottom: 0, left: 0 },
    }
    setElements((prev) => [...prev, baseElement])
    setSelectedElementId(baseElement.id)
  }

  function updateElement(id: string, changes: Partial<RoomElement>) {
    setElements((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  function addImageElement(url: string) {
    const newElement: RoomElement = {
      id: `image-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: 'image',
      title: 'Изображение',
      src: url,
      visible: true,
      position: { x: 80 + elements.length * 20, y: 80 + elements.length * 20 },
      size: { ...DEFAULT_ELEMENT_SIZE },
      rotation: 0,
      crop: { top: 0, right: 0, bottom: 0, left: 0 },
    }
    setElements((prev) => [...prev, newElement])
    setSelectedElementId(newElement.id)
  }

  function overlayLink(roomId: string){
    try{
      return new URL(`overlay/index.html?room=${roomId}`, location.href).toString()
    }catch(e){
      return `./overlay/index.html?room=${roomId}`
    }
  }

  async function addImage(){
    if(!selected) { showToast('Выберите комнату','error'); return }
    const url = imageUrl.trim()
    if(!url) { showToast('Введите URL картинки','error'); return }
    try {
      new URL(url)
    } catch(e) {
      showToast('Некорректный URL','error'); return
    }
    const props = { x:0,y:0,width:400,height:300,rotation:0,visible:true,url, placement: target }
    const { data, error } = await supabase.from('sources').insert({ room_id: selected, type: 'image', properties: props }).select().single()
    if(error) { showToast(getSupabaseErrorMessage(error, 'Ошибка добавления изображения'),'error'); return }
    setSources(prev => [...prev, data])
    addImageElement(url)
    setImageUrl('')
    showToast('Изображение добавлено','success')
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>){
    if(!selected) { showToast('Выберите комнату','error'); return }
    const file = e.target.files?.[0]
    if(!file) return
    if(!file.type.startsWith('image/')) { showToast('Выберите изображение','error'); return }
    setUploading(true)
    try{
      const path = `${selected}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadErr } = await supabase.storage.from('images').upload(path, file)
      if(uploadErr) {
        if (uploadErr.message?.includes('Bucket') || uploadErr.message?.includes('bucket')) {
          showToast('Ошибка загрузки: bucket images не найден. Проверьте, что он существует в Supabase.','error')
          return
        }
        throw uploadErr
      }
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
      const publicUrl = (urlData as any)?.publicUrl
      if (!publicUrl) {
        throw new Error('Не удалось получить публичный URL файла')
      }
      const props = { x:0,y:0,width:400,height:300,rotation:0,visible:true,url:publicUrl, placement: target }
      const { data, error } = await supabase.from('sources').insert({ room_id: selected, type: 'image', properties: props }).select().single()
      if(error) throw error
      setSources(prev => [...prev, data])
      showToast('Файл загружен и добавлен','success')
    }catch(err:any){
      const errMsg = String(err.message || err)
      if (errMsg.includes('Could not find the table') || errMsg.includes('table not found')) {
        showToast('Ошибка загрузки данных: таблица sources не найдена. Проверьте схему Supabase.','error')
      } else {
        showToast(errMsg,'error')
      }
    }finally{ setUploading(false); e.currentTarget.value = '' }
  }

  async function playUrlOnStream(url: string){
    if(!selected) { showToast('Выберите комнату','error'); return }
    const { error } = await supabase.from('playback_commands').insert({ room_id: selected, action: 'play_url', url })
    if(error) showToast(getSupabaseErrorMessage(error, 'Ошибка воспроизведения'),'error')
  }

  console.log('[App] Rendering, rooms:', rooms.length, 'selected:', selected)
  
  return (<>
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Toasts container */}
      <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
        {toasts.map(t=> (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-2 rounded shadow-lg ${t.type==='error' ? 'bg-red-600' : t.type==='success' ? 'bg-emerald-600' : 'bg-slate-700'}`}>
            <div className="text-sm">{t.text}</div>
            <button onClick={()=>setToasts(prev=>prev.filter(x=>x.id!==t.id))} className="text-white opacity-80">×</button>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Grace — Controller (прототип)</h1>
        <div className="flex gap-6">
          <main className="flex-1">
            <div className="mb-4 rounded bg-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Комната: {rooms.find(r=>r.id===selected)?.name || '-'}</h2>
                  {selected && <div className="text-xs text-slate-400">OBS overlay: <a className="text-cyan-300" href={overlayLink(selected)} target="_blank" rel="noreferrer">открыть</a></div>}
                </div>
                <div className="flex items-center gap-2">
                  <input placeholder="URL картинки" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="p-2 rounded bg-slate-700" />
                  <select value={target} onChange={e=>setTarget(e.target.value as any)} className="p-2 rounded bg-slate-700 text-slate-200">
                    <option value="overlay">Только OBS (overlay)</option>
                    <option value="background">Только фон (только модератор)</option>
                    <option value="both">Оба</option>
                  </select>
                  <button onClick={addImage} className="ml-2 bg-cyan-500 text-slate-900 px-3 py-2 rounded">Добавить</button>
                  <label className="ml-2 bg-slate-700 px-3 py-2 rounded cursor-pointer">
                    {uploading ? 'Загрузка...' : 'Загрузить файл'}
                    <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded bg-slate-800 p-4">
                <h3 className="font-semibold mb-2">Источники</h3>
                <ul className="space-y-2">
                  {sources.map(s=> (
                    <li key={s.id} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                      <div className="text-sm">{s.type}</div>
                          <div className="flex gap-2 items-center">
                            <div className="text-xs text-slate-300">{s.properties?.placement || 'overlay'}</div>
                            {s.type === 'sound' && <button onClick={()=>playUrlOnStream(s.properties?.url)} className="text-xs bg-cyan-500 px-2 rounded text-slate-900">Воспроизвести</button>}
                            {s.type === 'image' && <button onClick={()=>playUrlOnStream(s.properties?.url)} className="text-xs bg-cyan-500 px-2 rounded text-slate-900">Показать на стриме</button>}
                            <button onClick={()=>deleteSource(s.id)} className="text-xs bg-red-600 px-2 rounded">Удалить</button>
                          </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded bg-slate-800 p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white">Превью (локальное)</h3>
                  <div className="rounded-2xl bg-slate-900 px-3 py-1 text-xs text-slate-300">Shift — магнит | Alt — обрезка</div>
                </div>
                <OverlayEditor
                  elements={elements}
                  selectedId={selectedElementId}
                  onSelect={setSelectedElementId}
                  onUpdate={updateElement}
                />
              </div>
            </div>
            <div className="mt-8 rounded bg-slate-800 p-4">
              <div className="flex flex-wrap gap-3">
                <button onClick={() => createOverlayElement('image')} className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Добавить изображение</button>
                <button onClick={() => createOverlayElement('video')} className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600">Добавить видео</button>
                <button onClick={() => createOverlayElement('youtube')} className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600">Добавить YouTube</button>
                <button onClick={() => createOverlayElement('text')} className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600">Добавить текст</button>
                <button onClick={() => createOverlayElement('sound')} className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600">Добавить звук</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>

      {/* Floating rooms panel (collapsible) */}
      <button onClick={()=>setMenuOpen(v=>!v)} className="fixed left-4 top-4 z-50 bg-slate-800 p-2 rounded shadow text-white">{menuOpen ? 'Скрыть' : 'Комнаты'}</button>
      <div className={`fixed left-0 top-16 h-[calc(100%-4rem)] w-64 bg-slate-900 p-4 z-40 shadow-lg transform transition-transform duration-200 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-4">
          <input value={newRoomName} onChange={e=>setNewRoomName(e.target.value)} className="w-full p-2 rounded bg-slate-800" />
          <button onClick={createRoom} className="mt-2 w-full bg-cyan-500 text-slate-900 p-2 rounded">Создать комнату</button>
        </div>
        <ul className="space-y-2 overflow-auto" style={{maxHeight:'calc(100% - 5rem)'}}>
          {rooms.map(r=> (
            <li key={r.id} className="flex gap-2 items-center">
              <button onClick={()=>{ setSelected(r.id); setMenuOpen(false) }} className={`flex-1 text-left px-3 py-2 rounded-md transition-colors duration-150 ${selected===r.id? 'bg-slate-700':'bg-slate-800 hover:bg-slate-700'} shadow-sm`}>{r.name}</button>
              <button onClick={()=>{ navigator.clipboard?.writeText(overlayLink(r.id)).then(()=>showToast('Ссылка скопирована','success')).catch(()=>showToast('Не удалось скопировать','error')) }} className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors duration-150">Копировать</button>
              <button onClick={()=>deleteRoom(r.id)} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-150 text-white">Удалить</button>
            </li>
          ))}
        </ul>
      </div>
</>
  )
}
