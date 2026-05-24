import { createBrowserMediaClient } from './browserMediaClient';

const mediaClient = createBrowserMediaClient();
const resolvedMediaUrlCache = new Map<string, Promise<string | null>>();

export function isRenderableMediaUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return /^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:');
}

export async function resolveMediaUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (isRenderableMediaUrl(value)) {
    return value;
  }

  if (!resolvedMediaUrlCache.has(value)) {
    resolvedMediaUrlCache.set(
      value,
      mediaClient.getDownloadUrl(value).catch((error) => {
        console.error('Failed to resolve media URL:', error);
        resolvedMediaUrlCache.delete(value);
        return null;
      }),
    );
  }

  return resolvedMediaUrlCache.get(value) ?? null;
}
