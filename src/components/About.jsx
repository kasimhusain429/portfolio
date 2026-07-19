import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Kasim from '../assets/Kasim_image.png'
import SplitText from './ui/SplitText'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const para1Ref = useRef(null)
  const para2Ref = useRef(null)
  const bulletsRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })

      // Phase 1: Image reveals via circular clip-path mask
      tl.fromTo(
        imageRef.current,
        { clipPath: 'circle(0% at 50% 50%)', filter: 'grayscale(100%)' },
        { clipPath: 'circle(75% at 50% 50%)', filter: 'grayscale(0%)', duration: 0.35 },
        0
      )

      // Phase 2: First paragraph fades in
      tl.fromTo(
        para1Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.2 },
        0.2
      )

      // Phase 3: Second paragraph fades in
      tl.fromTo(
        para2Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.2 },
        0.35
      )

      // Phase 4: Bullet points slide in
      tl.fromTo(
        bulletsRef.current,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.25 },
        0.5
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-2 items-center">

          {/* Photo — circular clip-path reveal */}
          <div className="relative">
            <div
              ref={imageRef}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-2xl backdrop-blur-xl"
              style={{ clipPath: 'circle(0% at 50% 50%)' }}
            >
              <img
                src={Kasim}
                alt="Kasim Husain"
                className="h-[500px] w-full object-cover object-top transition-all duration-700"
              />

              {/* Glass Badge with specular highlight */}
              <div className="absolute bottom-6 left-6 right-6 overflow-hidden rounded-xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md">
                {/* Specular diagonal highlight */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, transparent 100%)',
                  }}
                />
                <div className="relative">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">Currently At</div>
                  <div className="mt-1 text-sm font-bold text-white">Cypherox Technologies</div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#00E5FF]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5FF] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E5FF]" />
                    </span>
                    React Developer
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copy — staggered paragraph reveal */}
          <div className="flex flex-col justify-center">
            <h2 className="flex flex-col text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl">
              <SplitText mode="reveal" stagger={0.04}>Who</SplitText>
              <SplitText mode="reveal" stagger={0.04} className="text-[#00E5FF]">I Am</SplitText>
            </h2>

            <div className="mt-8 space-y-6 text-sm font-medium leading-relaxed text-white/60">
              <p ref={para1Ref} style={{ opacity: 0 }}>
                I'm a <span className="text-white font-bold">Frontend Engineer</span> focused on cinematic motion and pixel-accurate interfaces. With 2+ years of production experience, I turn complex requirements into seamless digital experiences.
              </p>
              <p ref={para2Ref} style={{ opacity: 0 }}>
                At Cypherox Technologies, I architect reusable component libraries, integrate heavily with REST APIs, and optimize dashboards—recently <span className="text-[#00E5FF] font-bold">cutting load times by 30%</span> through code-splitting and lazy-loading.
              </p>
            </div>

            <div ref={bulletsRef} style={{ opacity: 0 }} className="mt-10 flex flex-col gap-5 border-l border-white/10 pl-6">
              {[
                'Figma-to-production across SaaS & E-commerce',
                'Agile sprints & cross-functional collaboration',
                'Obsessed with layout rhythm & performance'
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4 text-sm font-semibold text-white/80">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5FF]" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
