export function Footer() {
  return (
    <footer className="relative py-16 px-6 border-t border-[#262626] mt-12">
      <div className="mx-auto max-w-[1100px] flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 1 L13 4 L13 9 L7 13 L1 9 L1 4 Z" stroke="#525252" strokeWidth="1.2" />
          </svg>
          <p className="font-mono text-[12px] text-[#525252]">
            Griffin · Built 2026
          </p>
        </div>

        <p className="font-mono text-[12px] text-[#525252] flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <a
            href="https://github.com/Mariana-Codebase/Griffin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F5F5F5] transition-colors"
          >
            repo
          </a>
          <span className="text-[#262626]">·</span>
          <a
            href="https://github.com/anaarismendy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F5F5F5] transition-colors"
          >
            @anaarismendy
          </a>
          <span className="text-[#262626]">·</span>
          <a
            href="https://github.com/Mariana-Codebase"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F5F5F5] transition-colors"
          >
            @MarianaCodebase
          </a>
          <span className="text-[#262626]">·</span>
          <a href="#" className="hover:text-[#F5F5F5] transition-colors">demo video</a>
        </p>
      </div>
    </footer>
  )
}
