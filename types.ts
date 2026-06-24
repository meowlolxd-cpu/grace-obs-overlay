export type Room = {
  id: string
  name: string
  created_at?: string
}

export type Source = {
  id: string
  room_id: string
  type: 'image' | 'sound' | 'text' | 'video' | 'youtube'
  properties: Record<string, any>
  created_at?: string
}

export type Position = {
  x: number
  y: number
}

export type Size = {
  w: number
  h: number
}

export type Crop = {
  top: number
  right: number
  bottom: number
  left: number
}

export type TextStyle = {
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through'
  color?: string
  gradient?: string
  textAlign?: 'left' | 'center' | 'right'
}

export type RoomElementType = 'image' | 'sound' | 'video' | 'youtube' | 'text'

export type RoomElement = {
  id: string
  type: RoomElementType
  title?: string
  content?: string
  src?: string
  visible: boolean
  position: Position
  size: Size
  rotation: number
  crop?: Crop
  volume?: number
  playbackRate?: number
  muted?: boolean
  chromaKey?: boolean
  textStyle?: TextStyle
  created_at?: string
}

export type Toast = {
  id: number
  text: string
  type?: 'info' | 'success' | 'error'
}

