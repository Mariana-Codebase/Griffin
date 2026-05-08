import Link from "next/link"

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#262626] bg-[#0A0A0A]">
      <div className="mx-auto max-w-[1100px] px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-[22px] font-semibold tracking-tight text-[#F5F5F5]">
          Griffin
        </Link>
        <Link 
          href="#" 
          className="font-mono text-[13px] lowercase text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
        >
          docs
        </Link>
      </div>
    </nav>
  )
}
