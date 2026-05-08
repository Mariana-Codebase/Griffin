const steps = [
  {
    number: "01",
    title: "Paste your agent URL",
    description: "Point Griffin at any AI agent endpoint with wallet access.",
  },
  {
    number: "02",
    title: "5 attackers run in parallel",
    description: "Each one uses a different attack methodology.",
  },
  {
    number: "03",
    title: "Get an exploit-proof report",
    description: "Every finding is verifiable on Solana devnet.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-12 px-6">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              {/* Ghost number */}
              <span className="font-mono text-[96px] font-semibold text-[#1F1F1F] leading-none">
                {step.number}
              </span>
              
              {/* Content - fixed height to align bottom lines */}
              <div className="mt-6 flex flex-col justify-between min-h-[88px]">
                <div>
                  <h3 className="text-[18px] font-medium text-[#F5F5F5]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] text-[#A3A3A3] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Bottom line */}
              <div className="mt-6 h-px w-full bg-[#262626]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
