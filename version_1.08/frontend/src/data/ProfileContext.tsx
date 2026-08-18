import { createContext, useContext } from 'react';
import type { Profile } from '../types/profile';

export const ProfileContext = createContext<Profile | null>(null);

/** Profile data from /data/profile.json. Guaranteed present: routes only mount once it is loaded. */
export function useProfile(): Profile {
  const profile = useContext(ProfileContext);
  if (!profile) throw new Error('useProfile must be used inside <ProfileContext.Provider>');
  return profile;
}
