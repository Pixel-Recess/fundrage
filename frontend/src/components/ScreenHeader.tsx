import { MenuIcon } from './icons/MenuIcon';
import styles from './ScreenHeader.module.css';

export interface ScreenHeaderProps {
  title: string;
  showProfileIcon?: boolean;
  /** When provided, the profile icon becomes a button (used to open Account/Settings). */
  onProfileClick?: () => void;
  /** "white" matches Figma's Account frames — white bg, rage-200 title (node-id=3161-7722). */
  variant?: 'red' | 'white';
}

export function ScreenHeader({
  title,
  showProfileIcon = true,
  onProfileClick,
  variant = 'red',
}: ScreenHeaderProps) {
  return (
    <>
      <header className={`${styles.header} ${variant === 'white' ? styles.headerWhite : ''}`}>
        <div className={styles.headerRow}>
          {showProfileIcon &&
            (onProfileClick ? (
              <button
                type="button"
                className={styles.leadingButton}
                onClick={onProfileClick}
                aria-label="Account"
              >
                <MenuIcon size={25} />
              </button>
            ) : (
              <span className={styles.profileIcon}>
                <MenuIcon size={25} />
              </span>
            ))}
          <h1 className={styles.title}>{title}</h1>
        </div>
      </header>
      {/* Reserves the header's own height in normal flow, since the header itself is
          now fixed (and out of flow) so it can overlay content as the page scrolls. */}
      <div className={styles.headerSpacer} aria-hidden="true" />
    </>
  );
}
