import { AnimatePresence, motion } from 'framer-motion'
import { FiMoon, FiSun } from 'react-icons/fi'

export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light'

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--fg) transition active:scale-[0.98]"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
    >
      <motion.span
        className="absolute inset-0 rounded-xl"
        initial={false}
        animate={{
          opacity: 1,
          background:
            theme === 'light'
              ? 'linear-gradient(135deg, rgba(2,6,23,0.08), rgba(2,6,23,0.02))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -14, scale: 0.9, y: 2 }}
          animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
          exit={{ opacity: 0, rotate: 14, scale: 0.9, y: -2 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative"
        >
          {isLight ? <FiSun /> : <FiMoon />}
        </motion.span>
      </AnimatePresence>

      <motion.span
        className="pointer-events-none absolute -inset-px rounded-xl"
        initial={false}
        animate={{
          boxShadow:
            theme === 'light'
              ? '0 14px 40px -24px rgba(15, 23, 42, 0.35)'
              : '0 18px 55px -35px rgba(0, 0, 0, 0.9)',
        }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </motion.button>
  )
}
