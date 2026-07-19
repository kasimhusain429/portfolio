import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Kasim from '../assets/Kasim_image.png'
import SplitText from './ui/SplitText'
import { useIsMobile } from '../hooks/useDevice'

gsap.registerPlugin(ScrollTrigger)

/* ─── Desktop: GSAP scroll-pinned reveal ──────────────────── */
function AboutDesktop() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const para1Ref = useRef(null)
  const para2Ref = useRef(null)
  const bulletsRef = useRef(null)

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
          <AboutImage imageRef={imageRef} />
          <AboutCopy para1Ref={para1Ref} para2Ref={para2Ref} bulletsRef={bulletsRef} hiddenByDefault />
        </div>
      </div>
    </section>
  )
}

/* ─── Mobile: Simple scroll-reveal (no sticky pinning) ────── */
function AboutMobile() {
  return (
    <section id="about" className="relative py-24 px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <AboutImage />
        </motion.div>
        <AboutCopy />
      </div>
    </section>
  )
}

/* ─── Shared image component ──────────────────────────────── */
function AboutImage({ imageRef }) {
  return (
    <div className="relative">
      <div
        ref={imageRef}
        className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-2xl backdrop-blur-xl"
        style={imageRef ? { clipPath: 'circle(0% at 50% 50%)' } : undefined}
      >
        <img
          src={Kasim}
          alt="Kasim Husain"
          className="h-[350px] w-full object-cover object-top transition-all duration-700 sm:h-[420px] md:h-[500px]"
        />

        {/* Glass Badge with specular highlight */}
        <div className="absolute bottom-4 left-4 right-4 overflow-hidden rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:px-5 sm:py-4">
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
  )
}

/* ─── Shared copy component ───────────────────────────────── */
function AboutCopy({ para1Ref, para2Ref, bulletsRef, hiddenByDefault = false }) {
  const initialStyle = hiddenByDefault ? { opacity: 0 } : undefined

  return (
    <motion.div
      className="flex flex-col justify-center"
      {...(!hiddenByDefault && {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
      })}
    >
      <h2 className="flex flex-col text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl md:text-7xl">
        <SplitText mode="reveal" stagger={0.04}>Who</SplitText>
        <SplitText mode="reveal" stagger={0.04} className="text-[#00E5FF]">I Am</SplitText>
      </h2>

      <div className="mt-6 space-y-5 text-sm font-medium leading-relaxed text-white/60 sm:mt-8 sm:space-y-6">
        <p ref={para1Ref} style={initialStyle}>
          I'm a <span className="text-white font-bold">Frontend Engineer</span> focused on cinematic motion and pixel-accurate interfaces. With 2+ years of production experience, I turn complex requirements into seamless digital experiences.
        </p>
        <p ref={para2Ref} style={initialStyle}>
          At Cypherox Technologies, I architect reusable component libraries, integrate heavily with REST APIs, and optimize dashboards—recently <span className="text-[#00E5FF] font-bold">cutting load times by 30%</span> through code-splitting and lazy-loading.
        </p>
      </div>

      <div ref={bulletsRef} style={initialStyle} className="mt-8 flex flex-col gap-4 border-l border-white/10 pl-5 sm:mt-10 sm:gap-5 sm:pl-6">
        {[
          'Figma-to-production across SaaS & E-commerce',
          'Agile sprints & cross-functional collaboration',
          'Obsessed with layout rhythm & performance'
        ].map((point, i) => (
          <div key={i} className="flex items-start gap-3 text-sm font-semibold text-white/80 sm:gap-4">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5FF]" />
            {point}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Export ───────────────────────────────────────────────── */
export default function About() {
  const isMobile = useIsMobile()
  return isMobile ? <AboutMobile /> : <AboutDesktop />
}
