import type { FormationType, MotionState, PropagationStrategy } from '../types'

interface Props {
  controller: import('../lib/animation').MapMotionController | null
  strategy: PropagationStrategy; formation: FormationType; count: number; speed: number
  state: MotionState; maximum: number
  onStrategy: (value: PropagationStrategy) => void; onFormation: (value: FormationType) => void
  onCount: (value: number) => void; onSpeed: (value: number) => void
}

export function ControlPanel(props: Props) {
  const running = ['marching', 'returning'].includes(props.state)
  return <section className="motion-console" aria-label="Motion controls">
    <div className="console-readout">
      <span className="instrument-label">Sequence</span>
      <strong>{props.state === 'formed' ? 'Formation held' : props.state}</strong>
    </div>
    <fieldset>
      <legend>Trail</legend>
      {(['chain', 'wave', 'streams'] as const).map((value) => <label key={value} className="choice">
        <input type="radio" name="strategy" value={value} checked={props.strategy === value} onChange={() => props.onStrategy(value)} />
        <span>{value}</span>
      </label>)}
    </fieldset>
    <fieldset>
      <legend>Formation</legend>
      {(['ring', 'spiral'] as const).map((value) => <label key={value} className="choice">
        <input type="radio" name="formation" value={value} checked={props.formation === value} onChange={() => props.onFormation(value)} />
        <span>{value}</span>
      </label>)}
    </fieldset>
    <label className="range-control"><span>Pieces <b>{props.count}</b></span>
      <input type="range" min="20" max={Math.min(500, props.maximum)} step="10" value={Math.min(props.count, props.maximum)} onChange={(event) => props.onCount(Number(event.target.value))} />
    </label>
    <label className="range-control"><span>Tempo <b>{props.speed.toFixed(1)}×</b></span>
      <input type="range" min="0.5" max="2" step="0.1" value={props.speed} onChange={(event) => props.onSpeed(Number(event.target.value))} />
    </label>
    <div className="transport">
      <button className="march" disabled={!props.controller || running} onClick={() => props.controller?.play(props.strategy, props.formation, props.count, props.speed)}>March</button>
      {props.state === 'paused'
        ? <button onClick={() => props.controller?.resume()}>Resume</button>
        : <button disabled={!running} onClick={() => props.controller?.pause()}>Pause</button>}
      <button disabled={!props.controller} onClick={() => props.controller?.returnHome()}>Return</button>
      <button disabled={!props.controller} onClick={() => props.controller?.reset()}>Reset</button>
    </div>
  </section>
}
