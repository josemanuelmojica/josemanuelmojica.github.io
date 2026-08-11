declare module '@maptoposter/map-motion' {
  export class AntSequence {
    constructor(pieces: unknown[], options: { root: SVGSVGElement; onStateChange?: (state: import('./types').MotionState) => void })
    start(options?: Record<string, unknown>): Promise<void>
    pause(): void; resume(): void; returnHome(): Promise<void>; reset(): void; destroy(): void
  }
  export class RingFormation { constructor(options?: { center?: [number, number]; radius?: number }) }
  export class SpiralFormation { constructor(options?: { center?: [number, number]; spacing?: number; turns?: number }) }
}
