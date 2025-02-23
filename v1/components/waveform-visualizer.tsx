"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface WaveformVisualizerProps {
  isRecording: boolean
  audioLevel: number
}

export function WaveformVisualizer({ isRecording, audioLevel }: WaveformVisualizerProps) {
  const [time, setTime] = useState(0)
  const bars = Array.from({ length: 32 })

  useEffect(() => {
    let animationFrame: number
    const animate = () => {
      setTime((prevTime) => prevTime + 0.05)
      animationFrame = requestAnimationFrame(animate)
    }

    if (isRecording) {
      animate()
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [isRecording])

  const getHeight = (index: number, totalBars: number) => {
    if (!isRecording) return 2

    const position = index / totalBars
    const mainWave = Math.sin((position + time) * Math.PI * 2) * 0.5 + 0.5
    const secondaryWave = Math.sin((position + time) * Math.PI * 4) * 0.25 + 0.25
    const fastWave = Math.sin((position + time) * Math.PI * 8) * 0.125 + 0.125

    const height = (mainWave + secondaryWave + fastWave) * audioLevel * 60 + 10
    return Math.max(2, height)
  }

  return (
    <div className="w-full h-32 flex items-center justify-center gap-1 bg-muted/30 rounded-lg p-4">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: getHeight(i, bars.length),
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.5,
          }}
          className="w-2 bg-primary rounded-full"
          style={{
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  )
}

