"use client"

import { useRef, useState } from "react"
import { Plus, Upload, X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const BE_URL = "http://localhost:4000"

interface CreatePostDialogProps {
  authorId: string
  onCreated?: () => void
  trigger?: React.ReactNode
  className?: string
}

export function CreatePostDialog({ authorId, onCreated, trigger, className }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return

    setFiles(prev => [...prev, ...selected])
    selected.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviews(prev => [...prev, url])
    })
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!files.length) {
      setError("Vui lòng chọn ít nhất 1 ảnh")
      return
    }
    if (!authorId) {
      setError("Bạn cần đăng nhập để đăng bài")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach(f => formData.append("files", f))
      formData.append("authorId", authorId)
      formData.append("channelId", "web")

      const res = await fetch(`${BE_URL}/bwl/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Upload thất bại")
      }

      // Reset & close
      setFiles([])
      setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return [] })
      setOpen(false)
      onCreated?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      // cleanup previews
      previews.forEach(URL.revokeObjectURL)
      setFiles([])
      setPreviews([])
      setError(null)
    }
    setOpen(val)
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} className={className}>
          {trigger}
        </div>
      ) : (
        <div></div>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo bài đăng mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Upload area */}
            <div>
              <Label className="mb-2 block">Chọn ảnh (tối đa 10)</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click để chọn ảnh
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WEBP
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-muted group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {files.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !files.length}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang đăng...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-1.5" /> Đăng bài</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
