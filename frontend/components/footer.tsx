export function Footer() {
  return (
    <footer className="py-16 px-6">
      <div className="mx-auto max-w-[1100px] text-center">
        <p className="font-mono text-[13px] text-[#525252]">
          Built 2026
        </p>
        <p className="mt-2 font-mono text-[13px] text-[#525252]">
          <a href="https://github.com/Mariana-Codebase" target="_blank" rel="noopener noreferrer" className="hover:text-[#A3A3A3] transition-colors">github</a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:text-[#A3A3A3] transition-colors">x</a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:text-[#A3A3A3] transition-colors">demo video</a>
        </p>
      </div>
    </footer>
  )
}
