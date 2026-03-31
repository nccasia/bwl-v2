"use client"

const PALETTE = [
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-red-500",
]

interface UserAvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  avatarUrl?: string
  className?: string
}

export function UserAvatar({ name, size = "md", avatarUrl, className }: UserAvatarProps) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-lg" : "w-10 h-10 text-sm"


  return (
    <img src={avatarUrl || "/assets/img/mezon-logo.webp"} alt={name} className={`${dim} rounded-full object-cover shrink-0 ${className ?? ""}`} />
  )
}
