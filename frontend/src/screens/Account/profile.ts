import defaultAvatar from '../../assets/photos/default-avatar.svg';

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  /** Object URL, data URL, or bundled asset path; null shows the placeholder glyph. */
  photoUrl: string | null;
}

// Mock/demo data only — there's no real account behind this prototype. The default avatar is a
// generated illustrated avatar (DiceBear/Avataaars, free for personal & commercial use) rather
// than a real person's photo, since this is standing in for a fake user, not a real one.
export const DEFAULT_PROFILE: UserProfile = {
  name: 'Jordan Casey',
  username: 'jordancasey',
  email: 'jordan.casey@example.com',
  phone: '',
  location: 'Nebraska',
  photoUrl: defaultAvatar,
};
