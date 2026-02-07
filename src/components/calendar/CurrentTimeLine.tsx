import { useState, useEffect } from 'react'

const START_HOUR = 6
const END_HOUR = 22
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60

export function CurrentTimeLine() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = (hours - START_HOUR) * 60 + minutes

  if (totalMinutes < 0 || totalMinutes > TOTAL_MINUTES) return null

  const topPercent = (totalMinutes / TOTAL_MINUTES) * 100

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20 flex items-center"
      style={{ top: `${topPercent}%` }}
    >
      <div className="h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-red-500" />
      <div className="h-px flex-1 bg-red-500" />
    </div>
  )
}
