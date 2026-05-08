export function WhoBuiltThis() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-[1100px]">
        {/* Section heading with extending lines */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <div className="flex-1 h-px bg-[#262626]" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#525252]">
            Who Built This
          </span>
          <div className="flex-1 h-px bg-[#262626]" />
        </div>

        {/* Content */}
        <div className="max-w-[640px] mx-auto text-center">
          <p className="text-[17px] text-[#A3A3A3] leading-[1.7] mb-8">
            Griffin is built by Mariana Sinisterra (MarianaCodebase), a Computer 
            Engineering student and security researcher with a background in bug 
            bounty hunting, red teaming, and open source contributions to OpenClaw. 
            Griffin is the product this background was waiting to build.
          </p>

          {/* Links */}
          <div className="flex items-center justify-center gap-2 font-mono text-[14px]">
            <a 
              href="https://marianacodebase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#A78BFA] hover:underline"
            >
              marianacodebase.com
            </a>
            <span className="text-[#525252]">·</span>
            <a 
              href="https://linkedin.com/in/marianasinisterra" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#A78BFA] hover:underline"
            >
              linkedin
            </a>
            <span className="text-[#525252]">·</span>
            <a 
              href="https://github.com/Mariana-Codebase" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#A78BFA] hover:underline"
            >
              github
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
