"use client"

import { useState } from "react"
import { Search, MoreHorizontal, CheckCircle2 } from "lucide-react"
import { hotOptions } from "../../../public/assets/dimens/options"
import { PALETTE } from "../../../public/assets/dimens/duration"
import { getStatus, StoryBarProps } from "./StoryBar.types"

export function StoryBar({ channels, active, onSelect, hotPeriod, onHotPeriodChange }: StoryBarProps) {
  const [showHotMenu, setShowHotMenu] = useState(false)
  const renderItem = (id: string, name: string, subtext?: string, isVerified?: boolean, customAvatar?: React.ReactNode, status?: any, action?: React.ReactNode) => {
    const isActive = active === id
    return (
      <div
        key={id}
        onClick={() => onSelect(id)}
        className={`group w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${isActive ? "bg-muted" : ""}`}
      >
        <div className="relative shrink-0">
          {customAvatar ? (
            customAvatar
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${PALETTE[id.charCodeAt(id.length - 1) % PALETTE.length]}`}>
              {name[0]?.toUpperCase() ?? "#"}
            </div>
          )}
          {status?.online && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <div className="flex items-center gap-1 w-full">
            <span className={`font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
              {name}
            </span>
            {isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}
          </div>
          {(status?.time || subtext) && (
            <span className="text-xs text-muted-foreground font-medium">
              {status?.time || subtext}
            </span>
          )}
        </div>
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 backdrop-blur z-10 border-b">
        <h2 className="text-xl font-bold tracking-tight text-black/50">Channels</h2>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
        {/* All channel */}
        {renderItem("all", "Tất cả", undefined, false, (
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm bg-muted transition-colors ${active === "all" ? "border-primary text-primary" : "border-muted-foreground/20"}`}>
            All
          </div>
        ))}

        {/* Hot channel */}
        <div className="relative">
          {renderItem(
            "hot",
            "Hot",
            hotOptions.find(o => o.id === hotPeriod)?.label || "Quan trọng",
            false,
            (
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-colors bg-gradient-to-br from-orange-500 to-red-600 ${active === "hot" ? "border-primary" : "border-transparent"}`}>
                🔥
              </div>
            ),
            undefined,
            (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowHotMenu(!showHotMenu)
                }}
                className={`p-2 rounded-full hover:bg-muted-foreground/10 transition-colors ${showHotMenu ? "bg-muted-foreground/10 text-primary" : "text-muted-foreground"}`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            )
          )}

          {showHotMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowHotMenu(false)} />
              <div className="absolute right-2 top-full mt-1 w-48 bg-card border rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                {hotOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onHotPeriodChange?.(opt.id)
                      onSelect("hot")
                      setShowHotMenu(false)
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-muted
                      ${hotPeriod === opt.id ? "text-primary font-semibold" : "text-muted-foreground"}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dynamic Channels */}
        {channels.map(ch => {
          const name = ch.name || "Kênh không tên"
          const status = getStatus(ch.channelId, name)
          const isVerified = name.toLowerCase().includes("meta") || name.toLowerCase().includes("ai")
          return renderItem(ch.channelId, name, undefined, isVerified, undefined, status)
        })}
      </div>
    </div>
  )
}
