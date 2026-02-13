// Framer Motion animation variants for consistent animations across the app

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

export const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

export const fadeInDown = {
    hidden: { opacity: 0, y: -30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

export const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

export const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

// Container for stagger effect
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

// Children of stagger container
export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

// Hover scale effect
export const hoverScale = {
    rest: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: { duration: 0.3, ease: "easeOut" }
    }
}

// Hover lift effect (vertical translation)
export const hoverLift = {
    rest: { y: 0 },
    hover: {
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
    }
}

// Magnetic hover effect (follows cursor)
export const magneticHover = (x: number, y: number, strength: number = 0.2) => ({
    x: x * strength,
    y: y * strength,
    transition: { type: "spring", stiffness: 150, damping: 15 }
})

// Rotate in effect
export const rotateIn = {
    hidden: { opacity: 0, rotate: -10, scale: 0.9 },
    visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

// Blur in effect
export const blurIn = {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: {
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
    }
}

// 3D card tilt preset
export const cardTilt = {
    rest: {
        scale: 1,
        rotateX: 0,
        rotateY: 0
    },
    hover: (tiltX: number, tiltY: number) => ({
        scale: 1.05,
        rotateX: tiltY * 0.1,
        rotateY: tiltX * 0.1,
        transition: { duration: 0.2 }
    })
}

// Ripple effect
export const ripple = {
    initial: { scale: 0, opacity: 1 },
    animate: {
        scale: 4,
        opacity: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
}

// Bounce in
export const bounceIn = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
}

// Slide and fade combo
export const slideAndFade = (direction: "left" | "right" | "up" | "down" = "up") => {
    const directions = {
        up: { x: 0, y: 30 },
        down: { x: 0, y: -30 },
        left: { x: 30, y: 0 },
        right: { x: -30, y: 0 }
    }

    return {
        hidden: {
            opacity: 0,
            ...directions[direction]
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
        }
    }
}
