import { useEffect, useRef } from 'react'
import { MapMotionController } from '../lib/animation'
import type { MapPiece, MotionState } from '../types'

interface Props {
  svg: string
  pieces: MapPiece[]
  debug: boolean
  onReady: (controller: MapMotionController | null) => void
  onState: (state: MotionState) => void
  onMountedSvg: (svg: SVGSVGElement | null) => void
}

export function MapStage({ svg, pieces, debug, onReady, onState, onMountedSvg }: Props) {
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stage.current || !svg) return
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml')
    if (document.querySelector('parsererror')) throw new Error('The processed SVG is not valid XML')
    const mounted = window.document.importNode(document.documentElement, true) as unknown as SVGSVGElement
    mounted.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    stage.current.replaceChildren(mounted)
    const controller = new MapMotionController(mounted, pieces)
    const unsubscribe = controller.subscribe(onState)
    onReady(controller)
    onMountedSvg(mounted)
    return () => { unsubscribe(); controller.destroy(); onReady(null); onMountedSvg(null); mounted.remove() }
  }, [svg, pieces, onReady, onState, onMountedSvg])

  useEffect(() => { stage.current?.classList.toggle('is-debugging', debug) }, [debug])

  return <div ref={stage} className="map-stage" aria-label="Text-free animated street map" />
}
