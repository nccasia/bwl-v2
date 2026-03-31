import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}
