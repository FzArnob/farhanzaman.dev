import { configureApi } from '../lib/api';
import type { GamingData } from '../types/gaming';
import type { Profile, ProfileData } from '../types/profile';

/**
 * `{{base_url}}` and `{{domain}}` may be used anywhere in profile.json. They are
 * replaced with website_base_url / website_domain_name from the same file, so the
 * site's own address is written once and every link follows it.
 */
function resolveSiteTokens(profile: Profile): Profile {
  const baseUrl = profile.info.website_base_url.replace(/\/+$/, '');
  const domain = profile.info.website_domain_name;

  const replace = (value: string) =>
    value
      .replace(/\{\{\s*base_url\s*\}\}/g, baseUrl)
      .replace(/\{\{\s*domain\s*\}\}/g, domain);

  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') return replace(value);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item)]));
    }
    return value;
  };

  return walk(profile) as Profile;
}

/** Profile content, previously shipped as the profile_data.js global. */
export async function loadProfile(): Promise<Profile> {
  const response = await fetch('/data/profile.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Failed to load profile data (${response.status})`);
  const data: ProfileData = await response.json();

  const profile = resolveSiteTokens(data.profile);
  // The API host and profile id come from the same file, so there is one place to edit.
  configureApi(profile.info);
  return profile;
}

/** YouTube listing for the gaming page, previously the gaming_yt_data.js global. */
export async function loadGamingVideos(): Promise<GamingData> {
  const response = await fetch('/data/gaming_videos.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Failed to load gaming data (${response.status})`);
  return response.json();
}
