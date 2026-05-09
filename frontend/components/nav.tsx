import Link from "next/link"

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#262626] bg-[#0A0A0A]/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1100px] px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 text-[20px] font-semibold tracking-[-0.01em] text-[#F5F5F5]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M7 1 L13 4 L13 9 L7 13 L1 9 L1 4 Z"
              stroke="#F5F5F5"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M7 1 L13 4 L13 9 L7 13 L1 9 L1 4 Z"
              stroke="#FF3344"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="4 28"
              className="origin-center transition-transform duration-700 group-hover:rotate-180"
              style={{ transformBox: "fill-box" }}
            />
          </svg>
          Griffin
        </Link>

        <div className="flex items-center gap-5">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#525252]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-50 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4ADE80]" />
            </span>
            devnet
          </span>
          <Link
            href="#how-it-works"
            className="hidden sm:inline-block font-mono text-[12px] lowercase text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
          >
            how it works
          </Link>
          <Link
            href="#"
            className="font-mono text-[12px] lowercase text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
          >
            docs
          </Link>
        </div>
      </div>
    </nav>
  )
}
