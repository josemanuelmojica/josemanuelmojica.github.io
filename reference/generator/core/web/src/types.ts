export interface MapPiece {
  id: string
  element: string
  geometryElement: string
  type: string
  centroid: [number, number]
  bbox: [number, number, number, number]
  originalTransform: string
  originalPosition: { x: number; y: number }
  sourceId: string | null
  length: number
  neighbors: string[]
}

export interface PieceMetadata {
  pieceCount: number
  sourceGeometryCount: number
  splitSourceCount: number
  splitSources: string[]
  neighborCount: number
  neighborMethod: string
}

export interface PieceDocument { metadata: PieceMetadata; pieces: MapPiece[] }

export interface MotionMapManifest {
  id: string
  label: string
  svgUrl: string
  metadataUrl: string
  sourceGeometryCount: number
  candidateCount: number
  textFree: boolean
  generatedAt: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: Record<string, string>
}

export interface Location {
  id: number
  place: string
  state: string
  country: string
  latitude: number
  longitude: number
  radius: number
  theme: string
  interaction: string
  note: string
}

export type PropagationStrategy = 'chain' | 'wave' | 'streams'
export type FormationType = 'ring' | 'spiral'
export type MotionState = 'idle' | 'home' | 'marching' | 'paused' | 'formed' | 'returning' | 'destroyed'

export interface GeneratePosterRequest {
  city: string; country: string; theme: string; radius: number; format: 'svg' | 'png'
  latitude?: number; longitude?: number; candidateLimit?: number
}

export interface GeneratePosterResponse { file: string; posterUrl: string; motionMap?: MotionMapManifest }
