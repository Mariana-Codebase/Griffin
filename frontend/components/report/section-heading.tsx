interface Props {
  kicker: string
  title: string
  meta?: string
  id?: string
}

export function SectionHeading({ kicker, title, meta, id }: Props) {
  return (
    <header id={id} className="mb-8 scroll-mt-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#525252] mb-3">
        Section {kicker}
        {meta && <span className="ml-3 text-[#3F3F3F]">·</span>}
        {meta && <span className="ml-3 text-[#3F3F3F]">{meta}</span>}
      </p>
      <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-[#F5F5F5] leading-tight">
        {title}
      </h2>
      <div className="mt-4 h-px w-full bg-[#262626]" aria-hidden />
    </header>
  )
}

interface FieldLabelProps {
  children: React.ReactNode
  className?: string
}

export function FieldLabel({ children, className = "" }: FieldLabelProps) {
  return (
    <p className={`font-mono text-[10px] uppercase tracking-[0.22em] text-[#3F3F3F] mb-3 ${className}`}>
      {children}
    </p>
  )
}
