"use client"

import { useState } from "react"
import { createBrowserMediaClient } from "../media/browserMediaClient"
import { MediaCompleteResponse } from "../media/mediaClient"

export function useMediaUpload() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaClient = createBrowserMediaClient()

  async function upload(file: File): Promise<MediaCompleteResponse> {
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const result = await mediaClient.uploadFile({
        file,
        onProgress: ({ percentage }) => setProgress(percentage),
      })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  async function remove(mediaId: string): Promise<void> {
    setRemoving(true)
    setError(null)

    try {
      await mediaClient.deleteMedia(mediaId)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove media"
      setError(message)
      throw err
    } finally {
      setRemoving(false)
    }
  }

  return {
    upload,
    remove,
    uploading,
    removing,
    progress,
    error,
  }
}
