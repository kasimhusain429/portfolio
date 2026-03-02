import { FiArrowUp, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

export default function Footer() {
  const onTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="border-t border-(--border) py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
        <div>
          <div className="text-sm font-semibold text-(--fg)">
            <span className="bg-linear-to-r from-indigo-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Kasim
            </span>
            <span className="text-(--muted)">.dev</span>
          </div>
          <div className="mt-2 text-xs text-(--muted)">© {new Date().getFullYear()} All rights reserved.</div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="mailto:you@example.com"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--muted) transition hover:bg-(--card-strong)"
            aria-label="Email"
          >
            <FiMail />
          </a>
          <a
            href="https://www.linkedin.com/in/kasim-husain-6601071a8?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--muted) transition hover:bg-(--card-strong)"
            aria-label="LinkedIn"
          >
            <FiLinkedin />
          </a>
          {/* <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--muted) transition hover:bg-(--card-strong)"
            aria-label="GitHub"
          >
            <FiGithub />
          </a> */}

          <button
            type="button"
            onClick={onTop}
            className="ml-2 inline-flex h-10 items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--fg) transition hover:bg-(--card-strong)"
          >
            Top <FiArrowUp />
          </button>
        </div>
      </div>
    </footer>
  )
}
