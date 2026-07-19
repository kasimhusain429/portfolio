import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { AnimatePresence, motion } from 'framer-motion'
import { FiLinkedin, FiMail, FiSend } from 'react-icons/fi'
import SplitText from './ui/SplitText'

const links = [
  { icon: FiMail,     label: 'Email',    value: 'kasimhusain260@gmail.com',  href: 'mailto:kasimhusain260@gmail.com' },
  { icon: FiLinkedin, label: 'LinkedIn', value: 'linkedin.com/in/kasim-husain', href: 'https://www.linkedin.com/in/kasim-husain-6601071a8' },
]

export default function Contact() {
  const [loading, setLoading]       = useState(false)
  const [notice,  setNotice]        = useState(null)
  const [values,  setValues]        = useState({ name: '', email: '', message: '' })
  const [focused, setFocused]       = useState(null)

  const show = (type, message) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 4400)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    const { name, email, message } = values
    if (!name.trim() || !email.trim() || !message.trim()) {
      show('error', 'Please fill in all fields.')
      return
    }
    const svc = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const tpl = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const key = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    if (!svc || !tpl || !key) {
      show('error', 'EmailJS keys missing. Add VITE_EMAILJS_* to your .env file.')
      return
    }
    setLoading(true)
    try {
      await emailjs.send(svc, tpl, { name: name.trim(), email: email.trim(), message: message.trim(), reply_to: email.trim() }, { publicKey: key })
      setValues({ name: '', email: '', message: '' })
      show('success', "Message sent — I'll reply within 24 hours.")
    } catch {
      show('error', 'Failed to send. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="relative min-h-[120vh] py-32 flex items-center justify-center overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505] z-0 pointer-events-none" />
      
      <div className="mx-auto w-full max-w-6xl px-6 relative z-10 pointer-events-auto">
        <div className="text-center mb-20">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#00E5FF] uppercase">Initiate Sequence</p>
          <h2 className="mt-4 flex flex-col items-center text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl mix-blend-difference">
            <SplitText mode="char" stagger={0.03}>Let's</SplitText>
            <SplitText mode="char" stagger={0.03} className="text-[#00E5FF]">Connect</SplitText>
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-5 items-start">
          
          {/* Info Side */}
          <div className="md:col-span-2 space-y-8">
            <p className="text-sm font-medium leading-relaxed text-white/50">
              Open to frontend roles and freelance projects. Whether it's a new product, or a full-time opportunity — I'm always happy to chat.
            </p>

            <div className="space-y-4">
              {links.map((l) => {
                const Icon = l.icon
                return (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noreferrer' : undefined}
                    whileHover={{ x: 10 }}
                    className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-5 py-4 transition-all hover:bg-white/10 hover:border-[#00E5FF]/30"
                  >
                    <Icon size={18} className="text-white/40 group-hover:text-[#00E5FF] transition-colors" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">{l.label}</div>
                      <div className="text-sm font-bold text-white mt-0.5">{l.value}</div>
                    </div>
                  </motion.a>
                )
              })}
            </div>
            
            <div className="inline-flex items-center gap-3 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-5 py-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5FF] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E5FF]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">Available Now</span>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-3">
            <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl">
              {[
                { key: 'name',    label: 'Name',    type: 'text',  placeholder: 'YOUR NAME' },
                { key: 'email',   label: 'Email',   type: 'email', placeholder: 'YOU@DOMAIN.COM' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} className="relative">
                  <input
                    id={`contact-${key}`}
                    name={key}
                    type={type}
                    required
                    value={values[key]}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                    className="h-14 w-full rounded-xl border border-white/10 bg-black/40 px-5 font-mono text-sm font-medium text-white placeholder-white/20 outline-none transition focus:border-[#00E5FF]/50 focus:bg-white/5"
                    placeholder={placeholder}
                  />
                  {/* Glowing bottom border — expands from center on focus */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] flex justify-center overflow-hidden rounded-b-xl">
                    <div
                      className="h-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.5)] transition-all duration-500 ease-out"
                      style={{
                        width: focused === key ? '100%' : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="relative">
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-5 font-mono text-sm font-medium text-white placeholder-white/20 outline-none transition focus:border-[#00E5FF]/50 focus:bg-white/5"
                  placeholder="YOUR MESSAGE..."
                />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] flex justify-center overflow-hidden rounded-b-xl">
                  <div
                    className="h-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.5)] transition-all duration-500 ease-out"
                    style={{
                      width: focused === 'message' ? '100%' : '0%',
                    }}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full overflow-hidden rounded-xl bg-[#00E5FF] py-4 text-xs font-black uppercase tracking-widest text-black transition-all disabled:opacity-60"
              >
                {/* Gradient sweep on hover */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <span className="relative inline-flex items-center justify-center gap-3 font-mono">
                  {loading ? 'TRANSMITTING...' : 'SEND MESSAGE'} 
                  {!loading && <FiSend size={14} />}
                </span>
              </motion.button>
            </form>
          </div>
          
        </div>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed bottom-10 right-10 z-[70] max-w-xs rounded-xl border px-6 py-4 text-xs font-bold uppercase tracking-widest backdrop-blur-xl ${
              notice.type === 'success'
                ? 'border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]'
                : 'border-rose-400/30 bg-rose-500/10 text-rose-400'
            }`}
          >
            {notice.message}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
