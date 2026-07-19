import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * SectionReveal — reusable scroll-triggered reveal wrapper.
 *
 * Props:
 *  children   — content to reveal
 *  delay      — stagger delay in seconds (default 0)
 *  direction  — 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' (default 'up')
 *  duration   — animation duration in seconds (default 0.7)
 *  amount     — viewport threshold 0–1 (default 0.15)
 *  once       — only animate once (default true)
 *  className  — extra class names forwarded to the wrapper div
 */
export default function SectionReveal({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.7,
  amount = 0.15,
  once = true,
  className = '',
  as: Tag = 'div',
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, amount })

  const variants = {
    hidden: getHidden(direction),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function getHidden(direction) {
  switch (direction) {
    case 'down':
      return { opacity: 0, y: -30, x: 0, scale: 1, filter: 'blur(0px)' }
    case 'left':
      return { opacity: 0, x: 40, y: 0, scale: 1, filter: 'blur(0px)' }
    case 'right':
      return { opacity: 0, x: -40, y: 0, scale: 1, filter: 'blur(0px)' }
    case 'scale':
      return { opacity: 0, scale: 0.88, y: 0, x: 0, filter: 'blur(0px)' }
    case 'blur':
      return { opacity: 0, filter: 'blur(12px)', y: 10, x: 0, scale: 1 }
    case 'up':
    default:
      return { opacity: 0, y: 30, x: 0, scale: 1, filter: 'blur(0px)' }
  }
}

/**
 * SectionRevealGroup — staggered reveal for a list of children.
 */
export function SectionRevealGroup({
  children,
  stagger = 0.08,
  delayChildren = 0.05,
  className = '',
  amount = 0.1,
  once = true,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, amount })

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const revealItem = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}
