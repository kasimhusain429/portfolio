/**
 * Reveal primitives: the shared entrance language for headings and copy.
 *   <RevealLine>  one line of a heading rising out of a mask
 *   <RevealUp>    a block fading and rising into place
 * Both use the motion config and render in place (no motion) when the visitor prefers reduced motion.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { DUR, EASE, VIEWPORT } from '../../lib/motion'

export function RevealLine({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion()
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={`block ${className}`}
        initial={reduce ? false : { y: '105%' }}
        whileInView={{ y: '0%' }}
        viewport={VIEWPORT}
        transition={{ duration: DUR.reveal, delay, ease: EASE.out }}
      >
        {children}
      </motion.span>
    </span>
  )
}

export function RevealUp({ as = 'div', children, delay = 0, className = '', ...rest }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DUR.slow, delay, ease: EASE.out }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
