"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface SearchFilters {
  authorId: string
  fromDate: string
  toDate: string
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
}

const empty: SearchFilters = { authorId: "", fromDate: "", toDate: "" }

export function SearchBar({ onSearch }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(empty)
  const [open, setOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasActive = filters.authorId || filters.fromDate || filters.toDate

  const update = (patch: Partial<SearchFilters>) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => onSearch(next), 400)
  }

  const clear = () => {
    setFilters(empty)
    onSearch(empty)
  }

  return (
    <div className="flex gap-2 min-w-0 flex-1">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên tác giả..."
          value={filters.authorId}
          onChange={e => update({ authorId: e.target.value })}
          className="pl-9 h-10 text-[15px] rounded-full w-full"
        />
        {filters.authorId && (
          <button onClick={() => update({ authorId: "" })} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setOpen(v => !v)}
          className={`flex items-center gap-1.5 px-4 h-10 rounded-full border text-[15px] transition-colors whitespace-nowrap cursor-pointer
            ${open || filters.fromDate || filters.toDate
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary/40"}`}
        >
          <CalendarDays className="w-4 h-4" />
          {filters.fromDate || filters.toDate ? "Đã chọn ngày" : "ngày"}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-72 bg-card border rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Lọc theo ngày</h4>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Từ ngày</label>
                  <Input type="date" value={filters.fromDate}
                    onChange={e => update({ fromDate: e.target.value })}
                    className="h-9 text-sm rounded-xl" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Đến ngày</label>
                  <Input type="date" value={filters.toDate}
                    onChange={e => update({ toDate: e.target.value })}
                    className="h-9 text-sm rounded-xl" />
                </div>
                <div className="pt-2 border-t flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={clear} className="text-xs h-8">Xóa lọc</Button>
                  <Button size="sm" onClick={() => setOpen(false)} className="text-xs h-8">Áp dụng</Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {hasActive && !open && (
        <button onClick={clear} className="flex items-center gap-1 px-3 h-10 rounded-full border border-border text-[15px] text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors shrink-0 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
