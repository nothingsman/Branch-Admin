import { createBrowserMediaClient } from './browserMediaClient';

const mediaClient = createBrowserMediaClient();

export async function deleteQueuedMedia(mediaIds: string[]) {
  if (mediaIds.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    mediaIds.map((mediaId) => mediaClient.deleteMedia(mediaId)),
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error('Failed to delete deferred media:', {
        mediaId: mediaIds[index],
        error: result.reason,
      });
    }
  });
}
