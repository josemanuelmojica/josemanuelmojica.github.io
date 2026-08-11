import { AntSequence, RingFormation, SpiralFormation } from '@maptoposter/map-motion'
import type { FormationType, MapPiece, MotionState, PropagationStrategy } from '../types'

export class MapMotionController {
  private sequence: AntSequence
  private root: SVGSVGElement
  private pieces: MapPiece[]
  private listeners = new Set<(state: MotionState) => void>()

  constructor(root: SVGSVGElement, pieces: MapPiece[]) {
    this.root = root
    this.pieces = pieces
    this.sequence = new AntSequence(pieces, {
      root,
      onStateChange: (state: MotionState) => this.listeners.forEach((listener) => listener(state)),
    })
  }

  subscribe(listener: (state: MotionState) => void) { this.listeners.add(listener); return () => this.listeners.delete(listener) }

  play(strategy: PropagationStrategy, formationName: FormationType, count: number, speed: number) {
    const viewBox = this.root.viewBox.baseVal
    const center: [number, number] = [viewBox.x + viewBox.width / 2, viewBox.y + viewBox.height / 2]
    const formation = formationName === 'spiral'
      ? new SpiralFormation({ center, spacing: Math.max(3, Math.min(viewBox.width, viewBox.height) / 90) })
      : new RingFormation({ center, radius: Math.min(viewBox.width, viewBox.height) * 0.23 })
    return this.sequence.start({
      count: Math.min(count, this.pieces.length), strategy, formation,
      stagger: 18 / speed, staggerJitter: 24 / speed,
      duration: 760 / speed, durationJitter: 180 / speed, hold: 900 / speed,
    })
  }

  pause() { this.sequence.pause() }
  resume() { this.sequence.resume() }
  returnHome() { return this.sequence.returnHome() }
  reset() { this.sequence.reset() }
  destroy() { this.sequence.destroy(); this.listeners.clear() }
}
