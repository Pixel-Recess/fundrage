export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  /** Object URL or data URL for a locally-picked photo; null shows the placeholder glyph. */
  photoUrl: string | null;
}

// Mock/demo data only — there's no real account behind this prototype.
export const DEFAULT_PROFILE: UserProfile = {
  name: 'Jordan Casey',
  username: 'jordancasey',
  email: 'jordan.casey@example.com',
  phone: '',
  location: 'Nebraska',
  photoUrl: null,
};
