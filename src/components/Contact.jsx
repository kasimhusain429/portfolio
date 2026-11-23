/**
 * Contact — "The Greenhouse Mailbox"
 *
 * At the conservatory gate stands a navy mailbox. When you arrive its door
 * drops open and a postcard rises out of it: the contact form. Posting it
 * slides the card back inside, the door shuts and the flag flips up, while
 * EmailJS sends the message. If sending fails, the card comes back out.
 */
import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { FiAlertCircle, FiArrowUpRight, FiLinkedin, FiLoader, FiMail } from 'react-icons/fi'
import Mailbox from './contact/Mailbox'
import { Postmark, StampFront } from './journal/Stamps'
import { STAMPS } from '../data/experience'
import { EASE as MOTION } from '../lib/motion'
import { useDevice } from '../hooks/useDevice'
import { useParallax } from '../hooks/useParallax'
import { RevealLine, RevealUp } from './ui/Reveal'

const LINKS = [
  { icon: FiMail, label: 'Email', value: 'kasimhusain260@gmail.com', href: 'mailto:kasimhusain260@gmail.com' },
  { icon: FiLinkedin, label: 'LinkedIn', value: 'in/kasim-husain', href: 'https://www.linkedin.com/in/kasim-husain-6601071a8' },
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HOME_STAMP = STAMPS.find((s) => s.id === 'ahmedabad')
const EASE = MOTION.out
const MIN_MESSAGE = 10

function useCompact() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setCompact(!mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return compact
}

/* ─── Backdrop: the glasshouse at night ─────────────────────── */
function Glasshouse() {
  return (
    <svg viewBox="0 0 1000 420" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[88%] w-full" aria-hidden="true">
      <defs>
        <linearGradient id="ghGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--hue-500)" stopOpacity="0.05" />
          <stop offset="1" stopColor="var(--hue-400)" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      <g fill="url(#ghGlow)" stroke="var(--hue-400)" strokeOpacity="0.28" strokeWidth="1.4">
        <path d="M150 420V250q0-130 175-150 175 20 175 150v170Z" />
        <path d="M500 420V200q0-170 230-190 230 20 230 190v220Z" />
      </g>
      <g stroke="var(--hue-400)" strokeOpacity="0.16" strokeWidth="1">
        {[200, 250, 300, 350, 400, 450].map((x) => <path key={x} d={`M${x} 420V${x < 325 ? 140 + (325 - x) * 0.6 : 140 + (x - 325) * 0.6}`} />)}
        {[560, 620, 680, 730, 780, 840, 900].map((x) => <path key={x} d={`M${x} 420V${40 + Math.abs(x - 730) * 0.7}`} />)}
        {[300, 360].map((y) => <path key={y} d={`M150 ${y}H960`} />)}
      </g>
      <path d="M0 420h1000" stroke="var(--hue-300)" strokeOpacity="0.2" />
    </svg>
  )
}

/* ─── The postcard (form) ───────────────────────────────────── */
function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-eyebrow uppercase text-ink-soft">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            id={`${id}-err`}
            className="mt-1 flex items-center gap-1.5 font-ink text-[18px] leading-tight text-coral-700"
          >
            <FiAlertCircle aria-hidden="true" className="shrink-0 text-[15px]" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Postcard({ values, setValues, errors, onEdit, onSubmit, phase, note, compact }) {
  const busy = phase === 'sending'
  const lineInput =
    'font-ink mt-1 w-full rounded-t-[4px] border-0 border-b border-ink/30 bg-transparent px-1 pb-1 text-[22px] leading-tight text-hue-700 outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-ink-soft focus:border-hue-600 focus:bg-hue-300/15 focus:shadow-[0_1px_0_0_var(--hue-600)] aria-[invalid=true]:border-coral-600 aria-[invalid=true]:shadow-[0_1px_0_0_var(--color-coral-600)]'
  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    onEdit?.(k)
  }
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Write a postcard to Kasim"
      className={`journal-paper relative rounded-[6px] shadow-[0_40px_70px_-30px_color-mix(in_srgb,_var(--color-ink-950)_95%,_transparent),0_0_0_1px_color-mix(in_srgb,_var(--color-ink)_8%,_transparent)] ${
        compact ? 'p-5' : 'grid grid-cols-[1.2fr_1px_1fr] gap-7 p-7'
      }`}
    >
      {/* message side */}
      <div>
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-[15px] italic text-ink-soft">Postcard from the garden</p>
          {compact && <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft">Post card</p>}
        </div>
        <p className="font-ink mt-3 text-[26px] leading-none">Dear Kasim,</p>
        <label htmlFor="pc-message" className="sr-only">
          Your message
        </label>
        <textarea
          id="pc-message"
          name="message"
          rows={compact ? 5 : 7}
          maxLength={3000}
          value={values.message}
          onChange={set('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'pc-message-err' : undefined}
          placeholder="Tell me about the role, the project or just say hello…"
          className="journal-ruled font-ink mt-2 w-full resize-none rounded-[4px] border-0 bg-transparent px-1 py-0 text-[22px] leading-[28px] text-hue-700 outline-none transition-[background-color,box-shadow] duration-300 placeholder:text-ink-soft focus:bg-hue-300/12 focus:shadow-[0_0_0_2px_var(--hue-500)] aria-[invalid=true]:shadow-[0_0_0_2px_var(--color-coral-600)]"
        />
        <AnimatePresence>
          {errors.message && (
            <motion.p id="pc-message-err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 flex items-center gap-1.5 font-ink text-[18px] leading-tight text-coral-700">
              <FiAlertCircle aria-hidden="true" className="shrink-0 text-[15px]" /> {errors.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {!compact && <div className="bg-ink-900/15" aria-hidden="true" />}

      {/* address side */}
      <div className={compact ? 'mt-5 border-t border-ink/15 pt-5' : ''}>
        <div className="flex items-start justify-between gap-4">
          <div className="pt-1">
            {!compact && <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft">Post card</p>}
            <p className={`font-ink text-[21px] leading-[1.25] ${compact ? '' : 'mt-3'}`}>
              Kasim Husain
              <br />
              The Greenhouse
              <br />
              Ahmedabad, India
            </p>
          </div>
          <div className="relative h-[88px] w-[70px] shrink-0 rotate-[3deg]">
            <StampFront s={HOME_STAMP} w={70} h={88} n={6} />
            <div className="absolute -left-[54px] top-[18px] w-[92px]">
              <Postmark on={phase === 'sending' || phase === 'sent'} place="GREENHOUSE" />
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <Field id="pc-name" label="From" error={errors.name}>
            <input
              id="pc-name"
              name="name"
              autoComplete="name"
              maxLength={80}
              value={values.name}
              onChange={set('name')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'pc-name-err' : undefined}
              placeholder="Your name"
              className={lineInput}
            />
          </Field>
          <Field id="pc-email" label="Reply to" error={errors.email}>
            <input
              id="pc-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={120}
              value={values.email}
              onChange={set('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'pc-email-err' : undefined}
              placeholder="you@domain.com"
              className={lineInput}
            />
          </Field>
          {/* honeypot: people never see or fill this; bots usually do */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="pc-company">Company</label>
            <input id="pc-company" name="company" tabIndex={-1} autoComplete="off" value={values.company || ''} onChange={set('company')} />
          </div>
        </div>
        <button type="submit" disabled={busy} aria-busy={busy} className="group btn btn-primary mt-6 w-full">
          {busy ? 'Posting…' : 'Post it'}
          {busy ? (
            <FiLoader aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
          ) : (
            <FiArrowUpRight aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          )}
        </button>
        <AnimatePresence>
          {note && (
            <motion.p role="alert" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-start gap-1.5 font-ink text-[19px] leading-tight text-coral-700">
              <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0 text-[15px]" /> {note}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

/* ─── Section ───────────────────────────────────────────────── */
export default function Contact() {
  const compact = useCompact()
  const reduce = useReducedMotion()
  const small = useDevice()?.isSmallScreen ?? false
  const sectionRef = useRef(null)
  const skyY = useParallax(sectionRef, 50)
  const stageRef = useRef(null)
  const inView = useInView(stageRef, { amount: 0.35, once: true })
  // closed → open → sending → sent | error
  const [phase, setPhase] = useState('closed')
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [note, setNote] = useState(null)
  const [sentName, setSentName] = useState('')

  useEffect(() => {
    if (!inView || phase !== 'closed') return
    const t = setTimeout(() => setPhase('open'), reduce ? 0 : 350)
    return () => clearTimeout(t)
  }, [inView, phase, reduce])

  // an error clears as soon as that field is edited
  const onEdit = (k) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))

  const validate = () => {
    const e = {}
    const msg = values.message.trim()
    if (!msg) e.message = 'a few words, please'
    else if (msg.length < MIN_MESSAGE) e.message = 'a little more, please'
    if (!values.name.trim()) e.name = 'who is it from?'
    if (!values.email.trim()) e.email = 'where should I reply?'
    else if (!EMAIL_RE.test(values.email.trim())) e.email = 'that email looks off'
    return e
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (phase === 'sending') return
    // bots fill the hidden field: pretend it went through and send nothing
    if (values.company) {
      setPhase('sent')
      return
    }
    const e = validate()
    setErrors(e)
    setNote(null)
    if (Object.keys(e).length) {
      document.getElementById(e.message ? 'pc-message' : e.name ? 'pc-name' : 'pc-email')?.focus()
      return
    }
    const svc = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const tpl = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const key = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    if (!svc || !tpl || !key) {
      setNote('The mailbox isn’t connected yet. Please email me directly.')
      return
    }
    const name = values.name.trim()
    const email = values.email.trim()
    // both naming styles, so the EmailJS template works whether it uses {{name}} or {{from_name}}
    const payload = { name, from_name: name, email, from_email: email, reply_to: email, message: values.message.trim() }
    setShut(false)
    setPhase('sending')
    const minTime = new Promise((r) => setTimeout(r, reduce ? 300 : 1900))
    try {
      await Promise.all([emailjs.send(svc, tpl, payload, { publicKey: key }), minTime])
      setSentName(payload.name.split(' ')[0])
      setValues({ name: '', email: '', message: '', company: '' })
      setPhase('sent')
    } catch {
      await minTime
      setPhase('error')
      setNote('It came back undelivered. Try again, or email me directly.')
    }
  }

  const writeAnother = () => {
    setNote(null)
    setErrors({})
    setPhase('open')
  }

  const [shut, setShut] = useState(false)
  useEffect(() => {
    if (phase !== 'sending') return
    const t = setTimeout(() => setShut(true), reduce ? 0 : 1000)
    return () => clearTimeout(t)
  }, [phase, reduce])
  const doorOpen = phase === 'open' || phase === 'error' || (phase === 'sending' && !shut)
  const cardShown = phase === 'open' || phase === 'error'
  // the card grows out of (and shrinks back into) the mailbox door
  const origin = compact ? '50% -18%' : '-24% 62%'

  return (
    <section id="contact" ref={sectionRef} data-hue="iris" aria-labelledby="contact-title" className="relative overflow-hidden text-paper">
      {/* night sky + fireflies (fewer on phones), drifting slower than the page */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ y: skyY }}>
        {Array.from({ length: small ? 18 : 40 }, (_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-paper"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 45}%`,
              width: i % 7 === 0 ? 2.5 : 1.5,
              height: i % 7 === 0 ? 2.5 : 1.5,
              opacity: 0.25 + ((i * 13) % 10) / 20,
            }}
          />
        ))}
        {Array.from({ length: small ? 6 : 12 }, (_, i) => (
          <span
            key={`f${i}`}
            className="absolute h-[4px] w-[4px] rounded-full bg-hue-300 shadow-[0_0_10px_3px_color-mix(in_srgb,_var(--hue-300)_60%,_transparent)]"
            style={{ left: `${8 + ((i * 41) % 84)}%`, top: `${55 + ((i * 17) % 38)}%`, animation: `mote ${6 + (i % 4)}s ${i * 0.6}s ease-in-out infinite` }}
          />
        ))}
        <div className="absolute left-1/2 top-[58%] h-[70vmin] w-[120vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,_var(--hue-500)_28%,_transparent),transparent)]" />
      </motion.div>

      <div className="container-page relative pb-16 pt-section lg:pb-20">
        {/* header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <RevealUp as="p" className="eyebrow text-hue-300">07 — Contact</RevealUp>
            <h2 id="contact-title" className="mt-5 font-display text-h2 font-semibold">
              <RevealLine>Leave a note</RevealLine>
              <RevealLine delay={0.1}>
                <span className="bg-[linear-gradient(100deg,var(--hue-300),var(--hue-400)_45%,var(--color-paper))] bg-clip-text font-serif font-normal italic tracking-[-0.01em] text-transparent">
                  at the gate.
                </span>
              </RevealLine>
            </h2>
          </div>
          <RevealUp delay={0.2} className="max-w-md">
            <p className="text-body text-mist">
              Freelancing now and open to new projects and roles. Write a postcard and drop it in the box, or reach me directly.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {LINKS.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group btn btn-sm btn-ghost-dark font-sans font-normal"
                  >
                    <Icon className="text-hue-300 transition-colors group-hover:text-hue-700" />
                    <span className="text-haze transition-colors group-hover:text-ink-soft">{label}</span>
                    <span className="font-medium">{value}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-caption text-mist">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
              </span>
              Available for freelance · Ahmedabad, India (IST)
            </p>
          </RevealUp>
        </div>

        {/* the gate */}
        <div ref={stageRef} className={`relative mt-14 ${compact ? 'flex flex-col items-center' : 'grid min-h-[520px] grid-cols-[260px_minmax(0,1fr)] items-end gap-10'}`}>
          <Glasshouse />
          {/* ground */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[-10%] bottom-[-40px] h-[120px] bg-[radial-gradient(60%_100%_at_50%_100%,color-mix(in_srgb,_var(--hue-700)_60%,_transparent),transparent)]" />

          <div className={`relative z-10 ${compact ? '' : 'self-end justify-self-center'}`}>
            <Mailbox open={doorOpen} flag={phase === 'sent'} compact={compact} onOpen={() => phase === 'closed' && setPhase('open')} />
          </div>

          <div className={`relative z-20 w-full ${compact ? '-mt-[150px]' : 'max-w-[680px] self-center pb-16'}`}>
            <AnimatePresence mode="wait" initial={false}>
              {cardShown || phase === 'sending' ? (
                <motion.div
                  key="card"
                  style={{ transformOrigin: origin }}
                  initial={{ opacity: 0, scale: 0.08, rotate: -14, y: compact ? -30 : 40 }}
                  animate={
                    phase === 'sending'
                      ? { opacity: [1, 1, 0], scale: 0.08, rotate: -14, y: compact ? -30 : 40, transition: { duration: reduce ? 0.2 : 1.1, ease: MOTION.inOut } }
                      : { opacity: 1, scale: 1, rotate: compact ? 0 : -1.2, y: 0, transition: { duration: reduce ? 0.2 : 1.05, delay: reduce ? 0 : 0.35, ease: EASE } }
                  }
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className={compact ? 'pt-[170px]' : ''}
                >
                  <Postcard values={values} setValues={setValues} errors={errors} onEdit={onEdit} onSubmit={onSubmit} phase={phase} note={note} compact={compact} />
                </motion.div>
              ) : phase === 'sent' ? (
                <motion.div
                  key="sent"
                  role="status"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.8, ease: EASE } }}
                  exit={{ opacity: 0 }}
                  className={`journal-paper relative mx-auto max-w-[420px] rotate-[-2deg] rounded-[4px] p-7 text-ink shadow-[0_30px_60px_-28px_color-mix(in_srgb,_var(--color-ink-950)_95%,_transparent)] ${compact ? 'mt-[170px]' : ''}`}
                >
                  <span className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 bg-[color-mix(in_srgb,_var(--hue-300)_80%,_transparent)]" />
                  <p className="font-mono text-eyebrow uppercase text-teal-700">Posted · flag is up</p>
                  <p className="font-ink mt-3 text-[30px] leading-none">Thank you{sentName ? `, ${sentName}` : ''}!</p>
                  <p className="font-ink mt-3 text-[21px] leading-[1.2]">Your postcard is in the box. I’ll write back within a day or two.</p>
                  <button
                    type="button"
                    onClick={writeAnother}
                    className="btn btn-sm btn-ghost-light mt-5"
                  >
                    Write another
                  </button>
                </motion.div>
              ) : (
                <motion.div key="wait" className={compact ? 'h-[170px]' : 'h-[420px]'} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
