"use client"

import { motion } from "framer-motion"

interface ScoreCircleProps {
    score: number
    size?: number
    strokeWidth?: number
    showLabel?: boolean
}

export function ScoreCircle({ score, size = 60, strokeWidth = 5, showLabel = true }: ScoreCircleProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (score / 100) * circumference

    let color = "#ef4444" // red-500
    if (score >= 80) color = "#22c55e" // green-500
    else if (score >= 60) color = "#eab308" // yellow-500
    else if (score >= 40) color = "#f97316" // orange-500

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    stroke="var(--gray-200, #e5e7eb)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <motion.circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            {showLabel && (
                <div className="absolute flex flex-col items-center">
                    <motion.span
                        className="font-bold text-gray-900"
                        style={{ fontSize: size * 0.25 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score}
                    </motion.span>
                </div>
            )}
        </div>
    )
}
