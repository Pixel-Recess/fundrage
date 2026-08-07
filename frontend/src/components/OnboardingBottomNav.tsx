import styles from './OnboardingBottomNav.module.css';

export interface OnboardingBottomNavProps {
  onBack: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  nextEnabled?: boolean;
}

/**
 * The red-background bottom nav shared by the onboarding flow's later Figma frames
 * (topic/source selection, Welcome) — visually distinct from the white NavFooter used
 * elsewhere in the app (outline-white Back + solid-white/translucent-white Next).
 */
export function OnboardingBottomNav({
  onBack,
  backLabel = 'Back',
  onNext,
  nextLabel,
  nextEnabled = true,
}: OnboardingBottomNavProps) {
  return (
    <>
      <footer className={styles.nav}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          {backLabel}
        </button>
        <button
          type="button"
          className={`${styles.nextButton} ${nextEnabled ? styles.nextButtonEnabled : ''}`}
          disabled={!nextEnabled}
          onClick={onNext}
        >
          {nextLabel}
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />
    </>
  );
}
