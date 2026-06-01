"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Check, Upload, X } from "lucide-react"
import { useMediaUpload } from "../lib/hooks/useMediaUpload"
import { resolveMediaUrl } from "../lib/media/resolveMediaUrl"

export type MediaUploaderState = {
  hasChanges: boolean
  mediaId: string | null
  pendingRemovalIds: string[]
}

type MediaUploaderProps = {
  accept?: string
  imageOnly?: boolean
  onUploaded: (mediaId: string) => void
  onRemoved?: () => void
  onStateChange?: (state: MediaUploaderState) => void
  onBusyChange?: (busy: boolean) => void
  label?: string
  description?: string
  initialMediaId?: string | null
}

export function MediaUploader({
  accept,
  imageOnly = false,
  onUploaded,
  onRemoved,
  onStateChange,
  onBusyChange,
  label = "Upload File",
  description = "Click or drag file here",
  initialMediaId = null,
}: MediaUploaderProps) {
  const { upload, remove, uploading, removing, progress, error } =
    useMediaUpload()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedMediaId, setUploadedMediaId] = useState<
    string | null | undefined
  >(undefined)
  const [pendingRemovalIds, setPendingRemovalIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentMediaId =
    uploadedMediaId === undefined ? initialMediaId : uploadedMediaId

  useEffect(() => {
    onBusyChange?.(uploading || removing)
  }, [onBusyChange, removing, uploading])

  useEffect(() => {
    onStateChange?.({
      hasChanges: uploadedMediaId !== undefined || pendingRemovalIds.length > 0,
      mediaId: currentMediaId ?? null,
      pendingRemovalIds,
    })
  }, [currentMediaId, onStateChange, pendingRemovalIds, uploadedMediaId])

  useEffect(() => {
    let cancelled = false

    if (!currentMediaId) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setPreview(null)
        }
      })
      return () => {
        cancelled = true
      }
    }

    resolveMediaUrl(currentMediaId)
      .then((url) => {
        if (!cancelled) {
          setPreview(url)
        }
      })
      .catch((previewError) => {
        console.error("Failed to load media preview:", previewError)
      })

    return () => {
      cancelled = true
    }
  }, [currentMediaId])

  const clearSelectedFile = () => {
    setFile(null)
    setPreview(null)
    setUploadedMediaId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (imageOnly && !selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file.")
      return
    }

    setFile(selectedFile)

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }

    const previousMediaId = currentMediaId

    try {
      const result = await upload(selectedFile)

      if (previousMediaId && previousMediaId !== result.id) {
        if (previousMediaId === initialMediaId) {
          setPendingRemovalIds((currentIds) =>
            currentIds.includes(previousMediaId)
              ? currentIds
              : [...currentIds, previousMediaId]
          )
        } else {
          try {
            await remove(previousMediaId)
          } catch (removeError) {
            console.error("Remove failed:", removeError)
          }
        }
      }

      setUploadedMediaId(result.id)
      onUploaded(result.id)
    } catch (uploadError) {
      console.error("Upload failed:", uploadError)
    }
  }

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true)
    } else if (event.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0]

      if (imageOnly && !droppedFile.type.startsWith("image/")) {
        alert("Please upload an image file.")
        return
      }

      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(droppedFile)
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files
        fileInputRef.current.dispatchEvent(
          new Event("change", { bubbles: true })
        )
      }
    }
  }

  const removeFile = async () => {
    const mediaIdToRemove = currentMediaId
    const previousFile = file
    const previousPreview = preview
    const previousPendingRemovalIds = pendingRemovalIds

    clearSelectedFile()
    onRemoved?.()

    if (!mediaIdToRemove) {
      return
    }

    try {
      if (mediaIdToRemove === initialMediaId) {
        setPendingRemovalIds((currentIds) =>
          currentIds.includes(mediaIdToRemove)
            ? currentIds
            : [...currentIds, mediaIdToRemove]
        )
        return
      }

      await remove(mediaIdToRemove)
    } catch (removeError) {
      console.error("Remove failed:", removeError)
      setFile(previousFile)
      setPreview(previousPreview)
      setUploadedMediaId(mediaIdToRemove)
      setPendingRemovalIds(previousPendingRemovalIds)
      onUploaded(mediaIdToRemove)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600">{label}</label>

      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-slate-200 hover:border-primary hover:bg-slate-50"
        } ${uploading || removing ? "pointer-events-none opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() =>
          !(uploading || removing) && fileInputRef.current?.click()
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={uploading || removing}
          onChange={handleChange}
          className="hidden"
        />

        {(file || preview || currentMediaId) && !uploading ? (
          <div className="flex w-full flex-col items-center gap-4">
            {preview ? (
              <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-2xl border bg-slate-50">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 24rem"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-green-50 p-4 text-green-700">
                <Check className="h-5 w-5" />
                {file?.name || "File uploaded"}
              </div>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                void removeFile()
              }}
              className="flex items-center gap-1 text-xs text-red-600 hover:underline"
            >
              <X className="h-3 w-3" /> Remove file
            </button>
          </div>
        ) : uploading || removing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm font-medium text-primary">
              {uploading ? `Uploading... ${progress}%` : "Removing file..."}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-slate-100 p-4">
              <Upload className="h-8 w-8 text-slate-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900">{description}</p>
              <p className="mt-1 text-xs text-slate-500">
                {imageOnly
                  ? "PNG, JPG up to 10MB"
                  : "PNG, JPG, PDF, DOCX up to 10MB"}
              </p>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
