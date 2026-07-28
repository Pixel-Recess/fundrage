import styles from './NavFooter.module.css';

export interface NavFooterProps {
  onBack: () => void;
  onNext: () => void;
  nextEnabled: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export function NavFooter({
  onBack,
  onNext,
  nextEnabled,
  nextLabel = 'Next',
  backLabel = 'Back',
}: NavFooterProps) {
  return (
    <footer className={styles.footer}>
      <button type="button" className={`${styles.navButton} ${styles.backButton}`} onClick={onBack}>
        {backLabel}
      </button>
      <button
        type="button"
        className={`${styles.navButton} ${styles.nextButton} ${nextEnabled ? styles.nextButtonEnabled : ''}`}
        disabled={!nextEnabled}
        onClick={onNext}
      >
        {nextLabel}
      </button>
    </footer>
  );
}
