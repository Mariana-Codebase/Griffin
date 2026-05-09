import { Skeleton } from "@/components/ui/skeleton"

export function ReportSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Cover */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 mb-20 pb-16 border-b border-[#262626]">
        <div className="space-y-5">
          <Skeleton className="h-3 w-48 !bg-[#1F1F1F]" />
          <Skeleton className="h-14 w-3/4 !bg-[#1F1F1F]" />
          <Skeleton className="h-3 w-2/3 !bg-[#1F1F1F]" />
          <div className="flex gap-6">
            <Skeleton className="h-3 w-24 !bg-[#1F1F1F]" />
            <Skeleton className="h-3 w-24 !bg-[#1F1F1F]" />
          </div>
        </div>
        <Skeleton className="h-[220px] w-[220px] !bg-[#1F1F1F]" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <Skeleton className="h-20 w-3/4 !bg-[#1F1F1F]" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/2 !bg-[#1F1F1F]" />
          <Skeleton className="h-6 w-2/3 !bg-[#1F1F1F]" />
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-3 mb-20 max-w-[640px]">
        <Skeleton className="h-3 w-32 !bg-[#1F1F1F]" />
        <Skeleton className="h-8 w-1/2 !bg-[#1F1F1F]" />
        <Skeleton className="h-4 w-full !bg-[#1F1F1F]" />
        <Skeleton className="h-4 w-full !bg-[#1F1F1F]" />
        <Skeleton className="h-4 w-4/5 !bg-[#1F1F1F]" />
      </div>

      {/* Findings preview */}
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4 mb-12 pb-12 border-b border-[#262626]">
          <Skeleton className="h-3 w-40 !bg-[#1F1F1F]" />
          <Skeleton className="h-7 w-2/3 !bg-[#1F1F1F]" />
          <Skeleton className="h-4 w-full !bg-[#1F1F1F]" />
          <Skeleton className="h-4 w-full !bg-[#1F1F1F]" />
          <Skeleton className="h-24 w-full !bg-[#1F1F1F]" />
        </div>
      ))}

      <p className="text-center font-mono text-[12px] text-[#525252] mt-16 animate-pulse">
        Generating report…
      </p>
    </div>
  )
}
