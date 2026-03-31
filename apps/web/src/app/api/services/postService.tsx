import { Post } from "@/types/gallery"
import { useEffect, useState } from "react"

const BE_URL = process.env.NEXT_PUBLIC_API_URL

export interface Stats {
  totalPosts: number
  totalLikes: number
  totalComments: number
}

export const useUserStats = (username: string) => {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`${BE_URL}/bwl/users/${encodeURIComponent(username)}/stats`)
      .then(r => r.json())
      .then(data => {
        if (mounted) setStats(data)
      })
      .catch(() => { })

    return () => { mounted = false }
  }, [BE_URL, username])

  return { stats }
}

export const fetchTotalEmojis = async (username: string) => {
  try {
    const res = await fetch(`${BE_URL}/bwl?authorId=${encodeURIComponent(username)}&limit=1000`)
    if (!res.ok) return 0

    const data = await res.json()
    const allPosts: Post[] = data.data || []

    const promises = allPosts.map(async (p) => {
      try {
        const r = await fetch(`${BE_URL}/bwl/${p.id}/reactions`)
        if (!r.ok) return 0
        const reactionsObj = await r.json()

        return Object.values(reactionsObj as Record<string, string[]>)
          .reduce((acc, users) => acc + users.length, 0)
      } catch {
        return 0
      }
    })

    const counts = await Promise.all(promises)
    return counts.reduce((sum, c) => sum + c, 0)
  } catch {
    return 0
  }
}

export const fetchPosts = async (
  page: number,
  limit: number,
  username: string
) => {
  const url = `${BE_URL}/bwl?page=${page}&limit=${limit}&authorId=${encodeURIComponent(username)}`
  const res = await fetch(url)

  if (!res.ok) {
    console.error("fetchPosts error", res.status, res.statusText, url)
    return { data: [], total: 0 }
  }

  return res.json()
}

export const usePosts = (page: number, limit: number, username: string) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const json = await fetchPosts(page, limit, username)

        setPosts(prev => page === 1 ? json.data : [...prev, ...json.data])
        setTotal(json.total)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [page, username])

  return { posts, total, loading }
}