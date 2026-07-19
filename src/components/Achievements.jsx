import { useRef, useEffect } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import SplitText from './ui/SplitText'

function Counter({ from = 0, to, duration = 2 }) {
  const nodeRef = useRef()
  const inView = useInView(nodeRef, { once: true, margin: "-100px" })
  const count = useMotionValue(from)
  const rounded = useSpring(count, { duration: duration * 1000, bounce: 0 })

  useEffect(() => {
    if (inView) {
      count.set(to)
    }
  }, [inView, count, to])

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = Math.round(latest).toString()
      }
    })
  }, [rounded])

  return <span ref={nodeRef} />
}

const stats = [
  { label: 'Lines of Code', value: 120000, suffix: '+' },
  { label: 'Production Apps', value: 5, suffix: '' },
  { label: 'Components Built', value: 50, suffix: '+' },
  { label: 'Coffee Cups', value: 999, suffix: '+' }
]

export default function Achievements() {
  const sectionRef = useRef(null)

  return (
    <section id="achievements" ref={sectionRef} className="relative py-40">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6">
        
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#00E5FF] uppercase">Metrics</p>
          <h2 className="mt-4 flex flex-col text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl">
            <SplitText mode="char" stagger={0.03}>By The</SplitText>
            <SplitText mode="char" stagger={0.03} className="text-white/30">Numbers</SplitText>
          </h2>
        </div>

        <div className="mt-32 grid w-full grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-10 text-center backdrop-blur-xl transition-colors hover:border-[#00E5FF]/30 hover:bg-white/10"
            >
              <div className="flex items-baseline text-4xl font-black tracking-tighter text-white sm:text-6xl">
                <Counter from={0} to={stat.value} duration={2.5} />
                <span className="text-[#00E5FF]">{stat.suffix}</span>
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-widest text-white/40">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  )
}
