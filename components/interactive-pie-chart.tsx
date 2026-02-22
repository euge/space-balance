"use client"

import { useState, useMemo, useCallback } from "react"
import { Slider } from "@/components/ui/slider"

interface Segment {
  name: string
  value: number
  color: string
}

const INITIAL_SEGMENTS: Segment[] = [
  { name: "body space", value: 25, color: "#7DD8D8" },
  { name: "touch space", value: 25, color: "#EDB45C" },
  { name: "mental space", value: 25, color: "#D4A8D4" },
  { name: "people space", value: 25, color: "#A8B4E8" },
]

const CX = 200
const CY = 200
const RADIUS = 180

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")
}

function getLabelPosition(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const midAngle = (startAngle + endAngle) / 2
  const labelR = r * 0.58
  return polarToCartesian(cx, cy, labelR, midAngle)
}

export default function InteractivePieChart() {
  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS)

  const total = useMemo(() => segments.reduce((sum, s) => sum + s.value, 0), [segments])

  const handleSliderChange = useCallback(
    (index: number, newValue: number[]) => {
      setSegments((prev) => {
        const clampedNew = Math.min(Math.max(newValue[0], 1), 97)
        if (clampedNew === prev[index].value) return prev

        const remaining = 100 - clampedNew
        const otherIndices = prev
          .map((_, i) => i)
          .filter((i) => i !== index)

        const otherTotal = otherIndices.reduce((sum, i) => sum + prev[i].value, 0)

        const updated = [...prev]
        updated[index] = { ...updated[index], value: clampedNew }

        if (otherTotal === 0) {
          const share = Math.floor(remaining / otherIndices.length)
          const leftover = remaining - share * otherIndices.length
          otherIndices.forEach((i, idx) => {
            updated[i] = { ...updated[i], value: share + (idx < leftover ? 1 : 0) }
          })
        } else {
          // Distribute remaining proportionally using largest remainder method
          const exactShares = otherIndices.map((i) => ({
            i,
            exact: (prev[i].value / otherTotal) * remaining,
          }))
          const floored = exactShares.map((s) => ({
            ...s,
            floor: Math.max(1, Math.floor(s.exact)),
          }))

          let floorSum = floored.reduce((sum, s) => sum + s.floor, 0)
          let deficit = remaining - floorSum

          // Sort by largest fractional remainder to distribute leftover
          const sorted = [...floored].sort(
            (a, b) => (b.exact - b.floor) - (a.exact - a.floor)
          )
          for (const entry of sorted) {
            if (deficit <= 0) break
            entry.floor += 1
            deficit -= 1
          }

          for (const entry of sorted) {
            updated[entry.i] = { ...updated[entry.i], value: entry.floor }
          }
        }

        return updated
      })
    },
    []
  )

  const arcs = useMemo(() => {
    let currentAngle = 0
    return segments.map((segment) => {
      const sliceAngle = (segment.value / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + sliceAngle
      currentAngle = endAngle
      return { ...segment, startAngle, endAngle }
    })
  }, [segments, total])


  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto px-4">
      <div className="w-full aspect-square max-w-sm">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {arcs.map((arc, i) => {
            const percentage = Math.round((arc.value / total) * 100)
            const labelPos = getLabelPosition(
              CX,
              CY,
              RADIUS,
              arc.startAngle,
              arc.endAngle
            )

            return (
              <g key={arc.name}>
                <path
                  d={describeArc(CX, CY, RADIUS, arc.startAngle, arc.endAngle)}
                  fill={arc.color}
                  stroke="none"
                  className="transition-all duration-300 ease-out"
                />
                {(() => {
                  const isSmall = percentage < 15
                  const fontSize = isSmall ? Math.max(7, Math.round(percentage * 0.8 + 1)) : 13
                  const words = arc.name.split(" ")
                  const nameLineCount = isSmall ? words.length : 1
                  const lineHeight = isSmall ? fontSize + 3 : 18
                  const totalLines = nameLineCount + 1 // +1 for percentage
                  const startY = labelPos.y - ((totalLines - 1) * lineHeight) / 2

                  return (
                    <>
                      <text
                        x={labelPos.x}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-xs font-medium"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {isSmall ? (
                          words.map((word, wi) => (
                            <tspan key={wi} x={labelPos.x} y={startY + wi * lineHeight}>
                              {word}
                            </tspan>
                          ))
                        ) : (
                          <tspan x={labelPos.x} y={startY}>
                            {arc.name}
                          </tspan>
                        )}
                      </text>
                      <text
                        x={labelPos.x}
                        y={startY + nameLineCount * lineHeight}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-xs"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {percentage}%
                      </text>
                    </>
                  )
                })()}
              </g>
            )
          })}


        </svg>
      </div>

      <div className="w-full flex flex-col gap-5">
        {segments.map((segment, i) => (
          <div key={segment.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {segment.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </div>
            <Slider
              value={[segment.value]}
              min={1}
              max={97}
              step={1}
              onValueChange={(val) => handleSliderChange(i, val)}
              className="w-full"
              style={
                {
                  "--slider-color": segment.color,
                } as React.CSSProperties
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
