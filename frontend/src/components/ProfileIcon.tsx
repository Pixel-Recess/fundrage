export interface ProfileIconProps {
  size?: number;
}

export function ProfileIcon({ size = 20 }: ProfileIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="10" r="9.5" fill="none" stroke="currentColor" />
      <circle cx="10" cy="7.5" r="3" />
      <path d="M3.5 16.2c1.2-2.7 3.7-4.2 6.5-4.2s5.3 1.5 6.5 4.2A9.46 9.46 0 0 1 10 19.5a9.46 9.46 0 0 1-6.5-3.3Z" />
    </svg>
  );
}
