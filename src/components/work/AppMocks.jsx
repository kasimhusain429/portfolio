/**
 * Live, coded previews of the two app rebuilds. They scale with their box
 * (container query units) and only animate while `active`.
 */
import { useEffect, useState } from 'react'

const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" }
const pad = (n) => String(n).padStart(2, '0')

/* ─── Focus dashboard ───────────────────────────────────────── */
export function FocusMock({ active }) {
  const [now, setNow] = useState(() => new Date())
  const [left, setLeft] = useState(25 * 60 - 7)
  const [done, setDone] = useState(1)

  useEffect(() => {
    if (!active) return
    const t = setInterval(() => {
      setNow(new Date())
      setLeft((s) => (s <= 0 ? 25 * 60 : s - 1))
    }, 1000)
    const d = setInterval(() => setDone((n) => (n + 1) % 4), 3200)
    return () => {
      clearInterval(t)
      clearInterval(d)
    }
  }, [active])

  const h = now.getHours()
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const p = 1 - left / (25 * 60)
  const R = 15.9
  const tasks = ['Ship hero polish', 'Review pull request', 'Plan Monday sprint']

  return (
    <div className="relative h-full w-full overflow-hidden text-paper [container-type:inline-size]">
      {/* sky + hills */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-ink)_0%,var(--hue-700)_34%,var(--hue-500)_62%,var(--hue-300)_100%)]" />
      <div className="absolute left-[78%] top-[12%] h-[10cqw] w-[10cqw] rounded-full bg-[radial-gradient(circle,var(--color-paper)_30%,color-mix(in_srgb,_var(--color-paper)_25%,_transparent)_55%,transparent_70%)]" />
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[42%] w-full">
        <path d="M0 70C60 40 120 60 180 48s130-30 220 4V120H0Z" fill="var(--hue-400)" opacity="0.7" />
        <path d="M0 88c80-30 140-6 210-20s120-14 190 8V120H0Z" fill="var(--hue-700)" />
        <path d="M0 104c90-16 170 4 250-8s110 0 150 6V120H0Z" fill="var(--color-ink-950)" />
      </svg>

      {/* top bar */}
      <div className="absolute inset-x-[4cqw] top-[3.4cqw] flex items-center justify-between text-[2.1cqw]">
        <span className="font-medium opacity-90">{greet}, Kasim</span>
        <span className="flex items-center gap-[1cqw] rounded-full bg-paper/15 px-[1.8cqw] py-[0.8cqw] backdrop-blur-sm">
          <span className="flex h-[2cqw] items-end gap-[0.35cqw]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[0.45cqw] rounded-full bg-paper"
                style={{
                  height: active ? undefined : `${40 + i * 15}%`,
                  animation: active ? `eq 0.9s ${i * 0.15}s ease-in-out infinite alternate` : 'none',
                }}
              />
            ))}
          </span>
          Rain on glass
        </span>
      </div>

      {/* clock + timer */}
      <div className="absolute inset-x-0 top-[17%] flex flex-col items-center">
        <p className="font-display text-[13cqw] font-semibold leading-none tracking-[-0.04em] tabular-nums drop-shadow-[0_0.6cqw_2cqw_color-mix(in_srgb,_var(--color-ink-950)_45%,_transparent)]">
          {pad(h)}:{pad(now.getMinutes())}
        </p>
        <div className="mt-[2.2cqw] flex items-center gap-[1.6cqw] rounded-full bg-ink-950/35 py-[0.8cqw] pl-[0.9cqw] pr-[2cqw] text-[2.1cqw] backdrop-blur-md">
          <svg viewBox="0 0 36 36" className="h-[4.2cqw] w-[4.2cqw] -rotate-90">
            <circle cx="18" cy="18" r={R} fill="none" stroke="color-mix(in srgb, var(--color-paper) 25%, transparent)" strokeWidth="3.2" />
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              stroke="var(--color-paper)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * R}
              strokeDashoffset={2 * Math.PI * R * (1 - p)}
            />
          </svg>
          <span className="opacity-80">Deep work</span>
          <span className="font-semibold tabular-nums" style={mono}>
            {pad(Math.floor(left / 60))}:{pad(left % 60)}
          </span>
        </div>
      </div>

      {/* tasks */}
      <div className="absolute bottom-[4cqw] left-[4cqw] w-[34cqw] rounded-[1.6cqw] bg-ink-950/40 p-[1.8cqw] text-[1.85cqw] backdrop-blur-md">
        <p className="mb-[1cqw] text-[1.6cqw] uppercase tracking-[0.18em] text-hue-300">Today</p>
        {tasks.map((t, i) => (
          <p key={t} className="flex items-center gap-[1.2cqw] py-[0.45cqw]">
            <span
              className={`grid h-[2.2cqw] w-[2.2cqw] place-items-center rounded-full border border-paper/70 transition-colors duration-500 ${
                i < done ? 'bg-paper' : ''
              }`}
            >
              {i < done && <span className="h-[0.9cqw] w-[0.9cqw] rounded-full bg-hue-500" />}
            </span>
            <span className={`transition-opacity duration-500 ${i < done ? 'line-through opacity-55' : ''}`}>{t}</span>
          </p>
        ))}
      </div>
      <p className="absolute bottom-[4.4cqw] right-[4cqw] max-w-[30cqw] text-right font-serif text-[2.3cqw] italic leading-tight text-paper">
        “Small steps, every day.”
      </p>
    </div>
  )
}

/* ─── Typing test ───────────────────────────────────────────── */
const TEXT =
  'the quiet garden grows in layers of light and every small habit becomes a root that holds the whole tree steady through the storm'
const TYPOS = { 18: 'r', 61: 'n' } // a couple of honest mistakes

export function TypeMock({ active }) {
  const [i, setI] = useState(0)
  const [result, setResult] = useState(false)

  useEffect(() => {
    if (!active) return
    if (result) {
      const t = setTimeout(() => {
        setResult(false)
        setI(0)
      }, 2600)
      return () => clearTimeout(t)
    }
    if (i >= TEXT.length) {
      const t = setTimeout(() => setResult(true), 500)
      return () => clearTimeout(t)
    }
    const ch = TEXT[i]
    const t = setTimeout(() => setI((n) => n + 1), ch === ' ' ? 120 : 55 + ((i * 37) % 60))
    return () => clearTimeout(t)
  }, [active, i, result])

  const secs = Math.round((i / TEXT.length) * 22)
  const wpm = i > 8 ? Math.round(i / 5 / (Math.max(secs, 1) / 60)) : 0

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-ink-800),var(--color-ink-950)_70%)] text-paper [container-type:inline-size]" style={mono}>
      {/* header */}
      <div className="absolute inset-x-[5cqw] top-[4cqw] flex items-center justify-between">
        <span className="flex items-center gap-[1.2cqw] font-display text-[3.2cqw] font-semibold tracking-tight">
          <span className="grid h-[4cqw] w-[5.4cqw] grid-cols-3 gap-[0.4cqw] rounded-[0.8cqw] border border-hue-500 p-[0.6cqw]">
            {Array.from({ length: 6 }, (_, k) => (
              <span key={k} className={`rounded-[0.2cqw] ${k === 4 ? 'bg-hue-500' : 'bg-hue-400/50'}`} />
            ))}
          </span>
          type<span className="text-hue-400">.</span>
        </span>
        <span className="flex items-center gap-[1.6cqw] rounded-[1cqw] bg-ink-950/70 px-[2cqw] py-[1cqw] text-[1.8cqw] text-hue-400">
          <span>@ punctuation</span>
          <span className="text-hue-400">time</span>
          <span>words</span>
          <span className="h-[2cqw] w-px bg-hue-400/30" />
          <span>15</span>
          <span className="text-hue-400">30</span>
          <span>60</span>
        </span>
      </div>

      {/* live stats */}
      <div className="absolute left-[5cqw] top-[22%] flex gap-[3cqw] text-[3cqw] text-hue-400 tabular-nums">
        <span>{30 - secs}</span>
        <span className="text-hue-400">{wpm} wpm</span>
      </div>

      {/* words */}
      <p className="absolute inset-x-[5cqw] top-[34%] text-[3.25cqw] leading-[1.75] tracking-[0.01em]">
        {TEXT.split('').map((c, k) => {
          const typed = k < i
          const wrong = typed && TYPOS[k]
          return (
            <span key={k} className="relative">
              {k === i && !result && (
                <span
                  className="absolute -left-[0.1cqw] top-[0.35em] h-[1.1em] w-[0.35cqw] rounded-full bg-hue-500"
                  style={{ animation: active ? 'none' : 'caret 1s step-end infinite' }}
                />
              )}
              <span
                className={
                  wrong
                    ? 'text-hue-300 underline decoration-hue-300/70 decoration-[0.3cqw] underline-offset-[0.6cqw]'
                    : typed
                      ? 'text-paper'
                      : 'text-hue-400'
                }
              >
                {wrong || c}
              </span>
            </span>
          )
        })}
      </p>

      {/* footer keys */}
      <div className="absolute inset-x-0 bottom-[4cqw] flex justify-center gap-[1cqw] text-[1.6cqw] text-hue-400">
        <kbd className="rounded-[0.6cqw] bg-hue-400/15 px-[1cqw] py-[0.2cqw]">tab</kbd>+
        <kbd className="rounded-[0.6cqw] bg-hue-400/15 px-[1cqw] py-[0.2cqw]">enter</kbd> restart test
      </div>

      {/* result card */}
      <div
        className={`absolute inset-0 flex items-center justify-center gap-[6cqw] bg-ink-950/85 backdrop-blur-sm transition-opacity duration-500 ${
          result ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {[
          ['wpm', 94],
          ['acc', '98%'],
          ['raw', 97],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[2.4cqw] text-hue-400">{k}</p>
            <p className="text-[9cqw] leading-none text-hue-400">{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
