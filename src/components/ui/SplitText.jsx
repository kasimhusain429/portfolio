/**
 * SplitText — Word-by-word or character-by-character text animation.
 *
 * Splits text into individual elements and staggers their reveal.
 * Supports blur, slide, and scale animation modes.
 */
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 1 },
  visible: (stagger = 0.04) => ({
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.1,
    },
  }),
}

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(8px)',
    rotateX: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const charVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

/* Clip-path reveal — text rises from an invisible baseline */
const revealVariants = {
  hidden: {
    clipPath: 'inset(100% 0 0 0)',
    y: 20,
  },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1],
    },
  },
}

export default function SplitText({
  children,
  mode = 'word', // 'word' | 'char' | 'reveal'
  stagger = 0.04,
  className = '',
  as: Tag = 'div',
  inView = true,
  ...motionProps
}) {
  if (typeof children !== 'string') {
    return <Tag className={className}>{children}</Tag>
  }

  const MotionTag = motion[Tag] || motion.div

  if (mode === 'reveal') {
    const words = children.split(' ')
    return (
      <MotionTag
        className={`${className} flex flex-wrap`}
        variants={containerVariants}
        custom={stagger}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        {...motionProps}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={revealVariants}
            className="mr-[0.3em] inline-block"
            style={{ willChange: 'clip-path, transform' }}
          >
            {word}
          </motion.span>
        ))}
      </MotionTag>
    )
  }

  if (mode === 'char') {
    const chars = children.split('')
    return (
      <MotionTag
        className={`${className} inline-flex flex-wrap`}
        variants={containerVariants}
        custom={stagger}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        style={{ perspective: '600px' }}
        {...motionProps}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            variants={charVariants}
            className="inline-block"
            style={{
              display: 'inline-block',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </MotionTag>
    )
  }

  // Word mode
  const words = children.split(' ')
  return (
    <MotionTag
      className={`${className} flex flex-wrap`}
      variants={containerVariants}
      custom={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ perspective: '600px' }}
      {...motionProps}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className="mr-[0.3em] inline-block"
          style={{ transformOrigin: 'center bottom' }}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  )
}
