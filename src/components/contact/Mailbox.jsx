/**
 * The greenhouse mailbox: enamel box on a post, a door that drops open toward
 * you, a flag that flips up once a postcard is posted, and a lantern.
 */
import { motion } from 'framer-motion'

const SPRING = { type: 'spring', stiffness: 90, damping: 14 }

function Lantern() {
  return (
    <div className="absolute -left-[58px] top-[150px] w-[46px]" aria-hidden="true">
      <div className="absolute left-1/2 top-[30px] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,_var(--color-marigold-300)_55%,_transparent),color-mix(in_srgb,_var(--color-marigold-500)_18%,_transparent)_45%,transparent_70%)] [animation:flicker_3.6s_ease-in-out_infinite]" />
      <svg viewBox="0 0 46 84" className="relative w-full">
        <path d="M23 0v10" stroke="var(--hue-400)" strokeWidth="1.6" />
        <path d="M14 14h18l-3-4H17Z" fill="var(--hue-700)" />
        <rect x="11" y="14" width="24" height="5" rx="1.5" fill="var(--hue-500)" />
        <path d="M13 19h20l-2 40H15Z" fill="color-mix(in srgb, var(--color-paper-2) 35%, transparent)" stroke="var(--hue-700)" strokeWidth="2" />
        <path d="M23 19v40" stroke="var(--hue-700)" strokeWidth="1.2" />
        <ellipse cx="23" cy="44" rx="5" ry="9" fill="var(--color-paper)" opacity="0.95" className="[animation:flicker_2.4s_ease-in-out_infinite]" />
        <ellipse cx="23" cy="44" rx="9" ry="14" fill="var(--color-marigold-300)" opacity="0.35" />
        <rect x="11" y="59" width="24" height="6" rx="2" fill="var(--hue-500)" />
        <path d="M17 65h12l-2 6H19Z" fill="var(--hue-700)" />
      </svg>
    </div>
  )
}

export default function Mailbox({ open, flag, onOpen, compact }) {
  return (
    <div className={`relative ${compact ? 'h-[300px] w-[190px]' : 'h-[420px] w-[210px]'}`}>
      {/* the post, with a vine climbing it */}
      <div className="absolute bottom-0 left-1/2 h-[66%] w-[24px] -translate-x-1/2 rounded-t-[3px] bg-[linear-gradient(90deg,var(--color-ink-950),var(--hue-700)_45%,var(--color-ink-800))] shadow-[0_20px_30px_-10px_color-mix(in_srgb,_var(--color-ink-950)_70%,_transparent)]" />
      <svg viewBox="0 0 60 260" className="absolute bottom-0 left-1/2 h-[62%] w-[60px] -translate-x-1/2" aria-hidden="true">
        <path d="M30 260c-14-30 14-46 0-76s14-46 0-78 10-40 2-60" fill="none" stroke="var(--hue-400)" strokeWidth="2" />
        {[[22, 220, -40], [40, 186, 30], [18, 150, -30], [42, 110, 40], [20, 70, -35], [36, 40, 25]].map(([x, y, r]) => (
          <path key={y} d="M0 0c-4-8 0-16 9-17 1 9-3 15-9 17Z" fill="var(--hue-500)" transform={`translate(${x} ${y}) rotate(${r})`} />
        ))}
      </svg>
      <Lantern />

      {/* brace */}
      <div className={`absolute left-1/2 h-[12px] -translate-x-1/2 rounded-[3px] bg-[linear-gradient(180deg,var(--hue-700),var(--color-ink-950))] ${compact ? 'top-[144px] w-[120px]' : 'top-[168px] w-[136px]'}`} />
      {/* the box */}
      <div className={`absolute left-1/2 -translate-x-1/2 ${compact ? 'top-[8px] h-[138px] w-[150px]' : 'top-[10px] h-[160px] w-[172px]'}`}>
        {/* flag (pivot at the bottom of the pole) */}
        <motion.div
          className="absolute -right-[16px] top-[38%] h-[70px] w-[8px] origin-bottom"
          initial={false}
          animate={{ rotate: flag ? 0 : 90 }}
          transition={{ type: 'spring', stiffness: 160, damping: 9 }}
          aria-hidden="true"
        >
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,var(--hue-400),var(--color-paper),var(--hue-400))]" />
          <span className="absolute left-[6px] top-0 h-[24px] w-[34px] rounded-r-[3px] bg-[linear-gradient(180deg,var(--color-coral-400),var(--color-coral-600))] shadow-[0_3px_6px_color-mix(in_srgb,_var(--color-ink-950)_40%,_transparent)]" />
        </motion.div>

        {/* interior */}
        <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[8px] bg-[radial-gradient(70%_80%_at_50%_70%,var(--color-ink-800),var(--color-ink-950))] shadow-[inset_0_0_0_7px_var(--hue-700),inset_0_0_0_9px_color-mix(in_srgb,_var(--hue-400)_45%,_transparent),inset_0_14px_30px_color-mix(in_srgb,_var(--color-ink-950)_85%,_transparent),0_18px_30px_-12px_color-mix(in_srgb,_var(--color-ink-950)_70%,_transparent)]">
          <div className="absolute inset-x-[18%] bottom-[16%] h-[10px] rounded-full bg-[color-mix(in_srgb,_var(--hue-300)_12%,_transparent)] blur-[3px]" />
        </div>

        {/* door, hinged at the bottom, drops open toward you */}
        <div className="absolute inset-0 [perspective:520px]">
          <motion.button
            type="button"
            onClick={onOpen}
            disabled={open}
            aria-label={open ? 'Mailbox open' : 'Open the mailbox'}
            className="absolute inset-0 origin-bottom outline-none [transform-style:preserve-3d] focus-visible:[&>span:first-child]:ring-4"
            initial={false}
            animate={{ rotateX: open ? -152 : 0 }}
            transition={SPRING}
          >
            <span className="absolute inset-0 rounded-t-[999px] rounded-b-[8px] bg-[linear-gradient(160deg,var(--hue-700)_0%,var(--hue-700)_30%,var(--color-ink)_75%,var(--color-ink-950))] shadow-[inset_0_0_0_5px_color-mix(in_srgb,_var(--hue-400)_35%,_transparent),inset_0_-8px_16px_color-mix(in_srgb,_var(--color-ink-950)_40%,_transparent),0_18px_30px_-12px_color-mix(in_srgb,_var(--color-ink-950)_70%,_transparent)] ring-hue-300 [backface-visibility:hidden]">
              <span className="absolute left-[22%] top-[10%] h-[44%] w-[16%] rotate-[-18deg] rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,_var(--color-paper)_45%,_transparent),transparent)] blur-[2px]" />
              <span className="absolute inset-x-0 top-[46%] text-center font-serif text-[15px] italic text-paper">K. Husain</span>
              <span aria-hidden="true" className="absolute inset-x-0 top-[60%] text-center font-mono text-[8px] uppercase tracking-[0.3em] text-hue-300">Letters welcome</span>
              <span className="absolute left-1/2 top-[12%] h-[10px] w-[26px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,var(--color-paper),var(--color-marigold-400))] shadow-[0_2px_3px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent)]" />
            </span>
            <span className="absolute inset-0 rounded-t-[999px] rounded-b-[8px] bg-[linear-gradient(180deg,var(--hue-700),var(--color-ink-800))] shadow-[inset_0_0_0_5px_color-mix(in_srgb,_var(--hue-400)_25%,_transparent)] [backface-visibility:hidden] [transform:rotateX(180deg)]" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
