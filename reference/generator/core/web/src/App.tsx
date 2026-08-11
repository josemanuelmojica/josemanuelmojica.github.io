import { useCallback, useEffect, useMemo, useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { MapStage } from './components/MapStage'
import { generatePoster, getDefaultMap, listLocations, listThemes, loadMotionMap } from './lib/api'
import type { MapMotionController } from './lib/animation'
import type { FormationType, Location, MapPiece, MotionMapManifest, MotionState, PropagationStrategy, Theme } from './types'

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
  anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function rasterize(svg: SVGSVGElement) {
  const source = new XMLSerializer().serializeToString(svg)
  const image = new Image(); const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }))
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('PNG rendering failed')); image.src = url })
  const viewBox = svg.viewBox.baseVal; const scale = 2
  const canvas = document.createElement('canvas'); canvas.width = viewBox.width * scale; canvas.height = viewBox.height * scale
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url)
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG encoding failed')), 'image/png'))
}

export default function App() {
  const [manifest, setManifest] = useState<MotionMapManifest | null>(null)
  const [svg, setSvg] = useState(''); const [pieces, setPieces] = useState<MapPiece[]>([])
  const [themes, setThemes] = useState<Theme[]>([]); const [locations, setLocations] = useState<Location[]>([])
  const [locationId, setLocationId] = useState(1); const [themeId, setThemeId] = useState('sunset'); const [radius, setRadius] = useState(10000)
  const [controller, setController] = useState<MapMotionController | null>(null); const [mountedSvg, setMountedSvg] = useState<SVGSVGElement | null>(null)
  const [strategy, setStrategy] = useState<PropagationStrategy>('chain'); const [formation, setFormation] = useState<FormationType>('ring')
  const [count, setCount] = useState(120); const [speed, setSpeed] = useState(1); const [state, setState] = useState<MotionState>('idle')
  const [debug, setDebug] = useState(false); const [loading, setLoading] = useState(true); const [generating, setGenerating] = useState(false); const [error, setError] = useState('')
  const location = useMemo(() => locations.find((item) => item.id === locationId), [locations, locationId])

  const load = useCallback(async (next: MotionMapManifest) => {
    setLoading(true); setError('')
    try { const asset = await loadMotionMap(next); setManifest(next); setSvg(asset.svg); setPieces(asset.document.pieces); setState('home') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The map could not be loaded') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { Promise.all([getDefaultMap(), listThemes(), listLocations()])
    .then(([map, themeList, locationList]) => { setThemes(themeList); setLocations(locationList); return load(map) })
    .catch((reason) => { setError(reason instanceof Error ? reason.message : 'Studio initialization failed'); setLoading(false) }) }, [load])

  useEffect(() => { if (location) { setRadius(location.radius); if (themes.some((theme) => theme.id === location.theme)) setThemeId(location.theme) } }, [location, themes])

  const createMap = async () => {
    if (!location) return
    setGenerating(true); setError('')
    try {
      const result = await generatePoster({ city: location.place, country: location.country, latitude: location.latitude, longitude: location.longitude, radius, theme: themeId, format: 'svg', candidateLimit: 3000 })
      if (!result.motionMap) throw new Error('The generator did not return a motion asset')
      await load(result.motionMap)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Generation failed') }
    finally { setGenerating(false) }
  }

  const exportSvg = () => mountedSvg && download(new Blob([new XMLSerializer().serializeToString(mountedSvg)], { type: 'image/svg+xml' }), 'untitled-street-study.svg')
  const exportPng = async () => { if (!mountedSvg) return; try { download(await rasterize(mountedSvg), 'untitled-street-study.png') } catch (reason) { setError(reason instanceof Error ? reason.message : 'PNG export failed') } }

  return <main className="studio-shell">
    <header className="topbar">
      <a className="wordmark" href="/">MAP<span>→</span>POSTER</a>
      <div className="status-line"><i className={loading || generating ? 'working' : ''} />{generating ? 'Drawing new streets' : loading ? 'Loading vectors' : `${pieces.length.toLocaleString()} motion candidates`}</div>
      <div className="export-actions"><button onClick={exportSvg} disabled={!mountedSvg}>Export SVG</button><button onClick={exportPng} disabled={!mountedSvg}>Export PNG</button></div>
    </header>

    <aside className="setup-panel">
      <div><p className="eyebrow">Motion studio / V1</p><h1>Make the streets march.</h1><p className="intro">Detach real map geometry, gather it into a new shape, then put every street precisely home.</p></div>
      <div className="setup-fields">
        <label><span>Place</span><select value={locationId} onChange={(event) => setLocationId(Number(event.target.value))}>{locations.map((item) => <option key={item.id} value={item.id}>{item.place}, {item.state}</option>)}</select></label>
        <label><span>Map radius <b>{(radius / 1000).toFixed(0)} km</b></span><input type="range" min="3000" max="20000" step="1000" value={radius} onChange={(event) => setRadius(Number(event.target.value))} /></label>
        <div><span className="field-label">Treatment</span><div className="theme-grid">{themes.map((theme) => <button key={theme.id} className={themeId === theme.id ? 'active' : ''} onClick={() => setThemeId(theme.id)} title={theme.description}><i style={{ background: `linear-gradient(135deg, ${theme.colors.bg} 50%, ${theme.colors.road_primary} 50%)` }} /><span>{theme.name}</span></button>)}</div></div>
      </div>
      <button className="generate" disabled={!location || generating} onClick={createMap}>{generating ? 'Drawing…' : 'Draw this map'}<span>↗</span></button>
      <div className="setup-foot"><label className="debug-toggle"><input type="checkbox" checked={debug} onChange={(event) => setDebug(event.target.checked)} /><span>Highlight movable pieces</span></label><small>© OpenStreetMap contributors</small></div>
    </aside>

    <section className="workbench">
      <div className="sheet-header"><div><span className="instrument-label">Live vector sheet</span><strong>{manifest?.label ?? 'Preparing sheet'}</strong></div><dl><div><dt>Roads</dt><dd>{manifest?.sourceGeometryCount.toLocaleString() ?? '—'}</dd></div><div><dt>Movable</dt><dd>{manifest?.candidateCount.toLocaleString() ?? '—'}</dd></div><div><dt>State</dt><dd>{state}</dd></div></dl></div>
      <div className="sheet-frame">{loading && <div className="loading-map"><i /><span>Plotting geometry</span></div>}{error && <div className="error-card"><strong>Map unavailable</strong><span>{error}</span><button onClick={() => window.location.reload()}>Reload studio</button></div>}{svg && <MapStage svg={svg} pieces={pieces} debug={debug} onReady={setController} onState={setState} onMountedSvg={setMountedSvg} />}</div>
      <ControlPanel controller={controller} strategy={strategy} formation={formation} count={count} speed={speed} state={state} maximum={pieces.length} onStrategy={setStrategy} onFormation={setFormation} onCount={setCount} onSpeed={setSpeed} />
    </section>
  </main>
}
