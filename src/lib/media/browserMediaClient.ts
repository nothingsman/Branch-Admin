import { request } from '../api';
import { createMediaClient } from './mediaClient';

export function createBrowserMediaClient() {
  return createMediaClient({
    request,
  });
}
