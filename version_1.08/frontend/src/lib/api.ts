import type { ProfileInfo } from '../types/profile';

/**
 * Development-only override, so a local XAMPP backend can be used without touching
 * profile.json. Production builds always derive the host from `website_base_url`,
 * which keeps the domain configured in exactly one place.
 */
const ENV_HOST = import.meta.env.DEV
  ? (import.meta.env.VITE_API_HOST as string | undefined)
  : undefined;

let apiHost = ENV_HOST ?? '';
let profileId = '';

/** Called once, as soon as profile.json is loaded and before anything is rendered. */
export function configureApi(info: ProfileInfo): void {
  profileId = info.profile_id;
  if (!ENV_HOST) {
    apiHost = info.website_base_url.replace(/\/+$/, '') + '/backend/api';
  }
}

export function getApiHost(): string {
  return apiHost;
}

export function getProfileId(): string {
  return profileId;
}

export interface DirectMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Posts the contact form to the direct-message API. Rejects with the server's message on failure. */
export async function sendDirectMessage(payload: DirectMessagePayload): Promise<unknown> {
  const header = new Headers();
  header.append('Content-Type', 'application/x-www-form-urlencoded');

  const urlencoded = new URLSearchParams();
  urlencoded.append('profile_id', profileId);
  urlencoded.append('name', payload.name);
  urlencoded.append('email', payload.email);
  urlencoded.append('subject', payload.subject);
  urlencoded.append('message', payload.message);

  const response = await fetch(apiHost + '/send-direct-message.php', {
    method: 'POST',
    headers: header,
    body: urlencoded,
    redirect: 'follow',
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message ?? 'Request failed');
  }
  return result;
}

export interface VisitorTags {
  page_tag: string;
  feature_tag: string;
  activity_tag: string;
  action_tag: string;
}

/** Posts one visitor action to the tracking API. */
export function postVisitorAction(tags: VisitorTags, keepalive = false): Promise<unknown> {
  const screen_resolution = window.screen.width + 'x' + window.screen.height;
  const color_depth = window.screen.colorDepth ? String(window.screen.colorDepth) : 'None';
  const timezone_offset = String(new Date().getTimezoneOffset());
  const language = navigator.language || 'None';

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({
    profile_id: profileId,
    ...tags,
    screen_resolution,
    color_depth,
    timezone_offset,
    language,
  });

  return fetch(apiHost + '/track-visitor.php', {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
    keepalive,
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  });
}
