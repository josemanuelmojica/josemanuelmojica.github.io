import type { GeneratePosterRequest, GeneratePosterResponse, Location, MotionMapManifest, PieceDocument, Theme } from '../types'

async function json<T>(response: Response): Promise<T> {
  const value = await response.json()
  if (!response.ok) throw new Error(value.error ?? `Request failed (${response.status})`)
  return value
}

export async function listThemes(): Promise<Theme[]> {
  return json<{ themes: Theme[] }>(await fetch('/api/themes')).then((value) => value.themes)
}

export async function listLocations(): Promise<Location[]> {
  return json<{ locations: Location[] }>(await fetch('/api/locations')).then((value) => value.locations)
}

export async function getDefaultMap(): Promise<MotionMapManifest> {
  try { return await json<MotionMapManifest>(await fetch('/api/maps/default')) }
  catch { return json<MotionMapManifest>(await fetch('/maps/default.json')) }
}

export async function loadMotionMap(manifest: MotionMapManifest): Promise<{ svg: string; document: PieceDocument }> {
  const [svgResponse, metadataResponse] = await Promise.all([fetch(manifest.svgUrl), fetch(manifest.metadataUrl)])
  if (!svgResponse.ok || !metadataResponse.ok) throw new Error('The motion map asset could not be loaded')
  return { svg: await svgResponse.text(), document: await metadataResponse.json() }
}

export async function generatePoster(request: GeneratePosterRequest): Promise<GeneratePosterResponse> {
  return json<GeneratePosterResponse>(await fetch('/api/posters/generate', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request),
  }))
}
