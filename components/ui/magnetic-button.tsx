"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, MouseEvent } from "react"

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    strength?: number
}

export function MagneticButton({
    children,
    className = "",
    strength = 0.3
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 200 }
    const springX = useSpring(x, springConfig)
    const springY = useSpring(y, springConfig)

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY

        x.set(distanceX * strength)
        y.set(distanceY * strength)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.button
            ref={ref}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    )
}
