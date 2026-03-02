import { useMemo, useState } from 'react'
import emailjs from '@emailjs/browser'
import { AnimatePresence, motion } from 'framer-motion'
import { FiGithub, FiLinkedin, FiMail, FiSend } from 'react-icons/fi'

const toastMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [values, setValues] = useState({ name: '', email: '', message: '' })

  const links = useMemo(
    () => [
      { icon: FiMail, label: 'Email', value: 'kasimhusain260@gmail.com', href: 'mailto:kasimhusain260@gmail.com' },
      { icon: FiLinkedin, label: 'LinkedIn', value: 'linkedin.com/in/kasim-husain', href: 'https://www.linkedin.com/in/kasim-husain-6601071a8?utm_source=share_via&utm_content=profile&utm_medium=member_ios' },
      // { icon: FiGithub, label: 'GitHub', value: 'github.com/yourname', href: 'https://github.com' },
    ],
    [],
  )

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    const templateParams = {
      name: values.name.trim(),
      email: values.email.trim(),
      subject: 'Portfolio Inquiry',
      message: values.message.trim(),
      reply_to: values.email.trim(),
    }

    if (import.meta.env.DEV) {
      console.log('[EmailJS] templateParams', templateParams)
    }

    if (!templateParams.name || !templateParams.email || !templateParams.message) {
      setToast({ type: 'error', message: 'Please fill in name, email, and message.' })
      setTimeout(() => setToast(null), 4200)
      return
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setToast({ type: 'error', message: 'EmailJS keys missing. Add VITE_EMAILJS_* to your .env file.' })
      setTimeout(() => setToast(null), 4200)
      return
    }

    setLoading(true)
    try {
      await emailjs.send(serviceId, templateId, templateParams, { publicKey })
      setValues({ name: '', email: '', message: '' })
      setToast({ type: 'success', message: 'Message sent. I’ll reply soon.' })
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[EmailJS] send failed', err)
      }
      setToast({ type: 'error', message: 'Failed to send. Please try again in a moment.' })
    } finally {
      setLoading(false)
      setTimeout(() => setToast(null), 4200)
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold tracking-widest text-(--muted)">CONTACT</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
            Let&apos;s build <span className="text-(--muted)">something great</span>
          </h2>
        </motion.div>

        <div className="relative mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur">
            <div className="text-sm font-semibold text-(--fg)">Contact</div>
            <p className="mt-2 text-sm leading-relaxed text-(--muted)">
              Tell me about your project, timeline, and what “success” looks like. I’ll respond within 24–48
              hours.
            </p>

            <div className="mt-6 grid gap-3">
              {links.map((l) => {
                const Icon = l.icon
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--card) px-4 py-3 text-sm text-(--muted) transition hover:bg-(--card-strong)"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card)">
                        <Icon className="text-(--muted) transition group-hover:-rotate-6" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs text-(--muted)">{l.label}</div>
                        <div className="truncate font-medium text-(--fg)">{l.value}</div>
                      </div>
                    </div>
                    <span className="h-8 w-8 rounded-xl bg-linear-to-r from-indigo-500/20 via-cyan-400/15 to-purple-500/20 opacity-0 blur transition duration-300 group-hover:opacity-100" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur">
            <div className="text-sm font-semibold text-(--fg)">Send a message</div>
            <form onSubmit={onSubmit} className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-medium text-(--muted)">Name</span>
                <input
                  name="name"
                  required
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  className="h-11 rounded-2xl border border-(--border) bg-(--card) px-4 text-sm text-(--fg) outline-none transition focus:bg-(--card-strong)"
                  placeholder="Your name"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-medium text-(--muted)">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  className="h-11 rounded-2xl border border-(--border) bg-(--card) px-4 text-sm text-(--fg) outline-none transition focus:bg-(--card-strong)"
                  placeholder="you@domain.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-medium text-(--muted)">Message</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  className="rounded-2xl border border-(--border) bg-(--card) px-4 py-3 text-sm text-(--fg) outline-none transition focus:bg-(--card-strong)"
                  placeholder="What are we building?"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-500 via-cyan-500 to-purple-500 px-5 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_-20px_rgba(99,102,241,0.8)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Sending...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Send Message <FiSend className="transition group-hover:translate-x-0.5" />
                  </span>
                )}
              </button>

              {/* <p className="text-xs text-(--muted)">
                EmailJS is used for delivery. Add keys in <code className="text-(--fg)">.env</code>.
              </p> */}
            </form>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div
                {...toastMotion}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className={`fixed bottom-6 right-6 z-70 max-w-[340px] rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_55px_-35px_rgba(0,0,0,0.9)] backdrop-blur ${
                  toast.type === 'success'
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
                    : 'border-rose-400/20 bg-rose-500/10 text-rose-100'
                }`}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
