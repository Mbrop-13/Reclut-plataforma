"use client"

import { motion } from "framer-motion"

interface FloatingElementsProps {
    count?: number
    className?: string
}

export function FloatingElements({ count = 6, className = "" }: FloatingElementsProps) {
    const elements = Array.from({ length: count }, (_, i) => i)

    const randomPosition = () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
    })

    const randomSize = () => ({
        width: `${100 + Math.random() * 200}px`,
        height: `${100 + Math.random() * 200}px`,
    })

    const randomDuration = () => 15 + Math.random() * 15

    const randomDelay = () => Math.random() * 5

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {elements.map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-3xl opacity-20"
                    style={{
                        ...randomPosition(),
                        ...randomSize(),
                        background: i % 2 === 0
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    }}
                    animate={{
                        x: [0, Math.random() * 100 - 50, 0],
                        y: [0, Math.random() * 100 - 50, 0],
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: randomDuration(),
                        repeat: Infinity,
                        delay: randomDelay(),
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    )
}
