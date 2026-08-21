import { useCallback, useEffect, useRef, useState } from 'react'

interface Point {
  x: number
  y: number
}

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void
  initialDataUrl?: string
}

const WIDTH = 640
const HEIGHT = 220

export default function SignaturePad({ onChange, initialDataUrl }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Point[][]>([])
  const drawing = useRef(false)
  const [empty, setEmpty] = useState(true)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.strokeStyle = '#14201c'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const stroke of strokes.current) {
      ctx.beginPath()
      stroke.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
      ctx.stroke()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = WIDTH * dpr
    canvas.height = HEIGHT * dpr
    redraw()
  }, [redraw])

  function toPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    }
  }

  function handleDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    strokes.current.push([toPoint(event)])
  }

  function handleMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    strokes.current[strokes.current.length - 1].push(toPoint(event))
    redraw()
  }

  function handleUp() {
    if (!drawing.current) return
    drawing.current = false
    setEmpty(false)
    onChange(canvasRef.current?.toDataURL('image/png') ?? null)
  }

  function clear() {
    strokes.current = []
    setEmpty(true)
    redraw()
    onChange(null)
  }

  function undo() {
    strokes.current.pop()
    const isEmpty = strokes.current.length === 0
    setEmpty(isEmpty)
    redraw()
    onChange(isEmpty ? null : (canvasRef.current?.toDataURL('image/png') ?? null))
  }

  return (
    <div>
      <div className="border-line relative rounded-2xl border-2 border-dashed bg-white">
        {initialDataUrl && empty && (
          <img src={initialDataUrl} alt="Signature enregistrée" className="absolute inset-0 h-full w-full object-contain p-2" />
        )}
        <canvas
          ref={canvasRef}
          data-testid="signature-canvas"
          style={{ width: '100%', height: 'auto', aspectRatio: `${WIDTH}/${HEIGHT}`, touchAction: 'none' }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          className="block cursor-crosshair rounded-xl"
        />
        {empty && !initialDataUrl && (
          <span className="text-mist pointer-events-none absolute inset-0 flex items-center justify-center text-sm">
            Signez ici avec la souris, le doigt ou le stylet ✍️
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={empty}
          className="border-line hover:border-ink disabled:opacity-40 rounded-full border px-5 py-2 text-xs font-semibold transition-colors"
        >
          Annuler le trait
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={empty}
          className="rounded-full border border-red-200 px-5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
        >
          Effacer
        </button>
      </div>
    </div>
  )
}
