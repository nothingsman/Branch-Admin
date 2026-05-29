export type MediaId = string

export type MediaUploadInitResponse = {
  id: MediaId
  key: string
  upload_id: string
  expires_in: number
}

export type MediaPartUrlResponse = {
  presigned_url: string
  expires_in: number
}

export type UploadedPart = {
  part_number: number
  etag: string
}

export type MediaCompleteResponse = {
  id: MediaId
  status: "uploaded"
  etag: string
  size: number
}

export type MediaMetadata = {
  id: MediaId
  key: string
  bucket: string
  file_name: string
  content_type: string
  size: number
  etag: string
  status: "pending" | "uploaded" | "deleted" | string
  uploaded_by: string
  created_at: string
  updated_at: string
  download_url?: string
}

type ApiEnvelope<T> = {
  data: T
  message?: string
}

type RequestLike = <T>(
  path: string,
  options?: RequestInit,
  skipAuth?: boolean
) => Promise<T>

type MediaClientOptions = {
  request: RequestLike
}

const DEFAULT_PART_SIZE = 8 * 1024 * 1024

function unwrapEnvelope<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (payload as ApiEnvelope<T>).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

export function createMediaClient(options: MediaClientOptions) {
  const apiRequest = options.request

  async function initiateUpload(file: File): Promise<MediaUploadInitResponse> {
    const response = await apiRequest<
      MediaUploadInitResponse | ApiEnvelope<MediaUploadInitResponse>
    >("/api/media/upload", {
      method: "POST",
      body: JSON.stringify({
        file_name: file.name,
        content_type: file.type || "application/octet-stream",
      }),
    })

    return unwrapEnvelope(response)
  }

  async function getPartUrl(params: {
    mediaId: MediaId
    uploadId: string
    partNumber: number
  }): Promise<MediaPartUrlResponse> {
    const response = await apiRequest<
      MediaPartUrlResponse | ApiEnvelope<MediaPartUrlResponse>
    >(`/api/media/${params.mediaId}/multipart/part-url`, {
      method: "POST",
      body: JSON.stringify({
        upload_id: params.uploadId,
        part_number: params.partNumber,
      }),
    })

    return unwrapEnvelope(response)
  }

  async function uploadPart(params: {
    presignedUrl: string
    blob: Blob
  }): Promise<string> {
    const response = await fetch(params.presignedUrl, {
      method: "PUT",
      body: params.blob,
    })

    if (!response.ok) {
      throw new Error(
        `Part upload failed: ${response.status} ${response.statusText}`
      )
    }

    const etag = response.headers.get("etag") ?? response.headers.get("ETag")
    if (!etag) {
      throw new Error("Part upload succeeded but no ETag was returned.")
    }

    return etag
  }

  async function completeUpload(params: {
    mediaId: MediaId
    uploadId: string
    parts: UploadedPart[]
  }): Promise<MediaCompleteResponse> {
    const response = await apiRequest<
      MediaCompleteResponse | ApiEnvelope<MediaCompleteResponse>
    >(`/api/media/${params.mediaId}/multipart/complete`, {
      method: "POST",
      body: JSON.stringify({
        upload_id: params.uploadId,
        parts: params.parts,
      }),
    })

    return unwrapEnvelope(response)
  }

  async function abortUpload(params: {
    mediaId: MediaId
    uploadId: string
  }): Promise<void> {
    await apiRequest(`/api/media/${params.mediaId}/multipart/abort`, {
      method: "POST",
      body: JSON.stringify({
        upload_id: params.uploadId,
      }),
    })
  }

  async function getMedia(mediaId: MediaId): Promise<MediaMetadata> {
    const response = await apiRequest<
      MediaMetadata | ApiEnvelope<MediaMetadata>
    >(`/api/media/${mediaId}`, {
      method: "GET",
    })

    return unwrapEnvelope(response)
  }

  async function getDownloadUrl(mediaId: MediaId): Promise<string> {
    const response = await apiRequest<
      { download_url: string } | ApiEnvelope<{ download_url: string }>
    >(`/api/media/${mediaId}/url`, {
      method: "GET",
    })

    return unwrapEnvelope(response).download_url
  }

  async function deleteMedia(mediaId: MediaId): Promise<void> {
    await apiRequest(`/api/media/${mediaId}`, {
      method: "DELETE",
    })
  }

  async function uploadFile(params: {
    file: File
    partSize?: number
    onProgress?: (progress: {
      uploadedBytes: number
      totalBytes: number
      percentage: number
    }) => void
  }): Promise<MediaCompleteResponse> {
    const file = params.file
    const partSize = params.partSize ?? DEFAULT_PART_SIZE
    const initiated = await initiateUpload(file)
    const parts: UploadedPart[] = []
    let uploadedBytes = 0

    try {
      const totalParts = Math.ceil(file.size / partSize)

      for (let index = 0; index < totalParts; index += 1) {
        const partNumber = index + 1
        const start = index * partSize
        const end = Math.min(start + partSize, file.size)
        const blob = file.slice(start, end)
        const { presigned_url } = await getPartUrl({
          mediaId: initiated.id,
          uploadId: initiated.upload_id,
          partNumber,
        })
        const etag = await uploadPart({
          presignedUrl: presigned_url,
          blob,
        })

        parts.push({
          part_number: partNumber,
          etag,
        })

        uploadedBytes += blob.size
        params.onProgress?.({
          uploadedBytes,
          totalBytes: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
        })
      }

      return await completeUpload({
        mediaId: initiated.id,
        uploadId: initiated.upload_id,
        parts,
      })
    } catch (error) {
      await abortUpload({
        mediaId: initiated.id,
        uploadId: initiated.upload_id,
      }).catch(() => undefined)

      throw error
    }
  }

  return {
    initiateUpload,
    getPartUrl,
    uploadPart,
    completeUpload,
    abortUpload,
    getMedia,
    getDownloadUrl,
    deleteMedia,
    uploadFile,
  }
}
