import logo from '../../assets/brand/Logotype-Square-White.svg';
import styles from './CreateAccount.module.css';

function AppleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor" aria-hidden="true">
      <path d="M150.4 129.4c-2.7 6.2-5.9 11.9-9.7 17.2-5.2 7.2-9.4 12.2-12.7 14.9-5.1 4.5-10.6 6.8-16.4 6.9-4.2 0-9.3-1.2-15.2-3.6-6-2.4-11.5-3.6-16.5-3.6-5.3 0-11 1.2-17.1 3.6-6.1 2.4-11 3.7-14.8 3.8-5.6.2-11.2-2.1-16.8-6.9-3.6-2.9-8-8.1-13.1-15.6-5.5-8-10-17.3-13.5-27.9-3.8-11.4-5.7-22.5-5.7-33.2 0-12.3 2.7-22.9 8-31.8 4.2-7.1 9.8-12.7 16.8-16.8 7-4.1 14.6-6.2 22.7-6.4 4.5 0 10.4 1.4 17.8 4.1 7.4 2.7 12.1 4.1 14.2 4.1 1.6 0 6.9-1.6 15.6-4.9 8.3-3 15.3-4.3 21-3.8 15.5 1.3 27.2 7.4 34.9 18.4-13.9 8.4-20.8 20.2-20.6 35.3.1 11.8 4.3 21.6 12.6 29.4 3.7 3.6 7.9 6.3 12.5 8.3-1 2.9-2.1 5.8-3.3 8.5zM119.1 3.4c0 9.2-3.4 17.7-10.1 25.6-8.1 9.4-17.9 14.8-28.6 13.9-.1-1.1-.2-2.3-.2-3.5 0-8.8 3.9-18.3 10.7-26 3.4-3.9 7.7-7.2 12.9-9.8 5.2-2.6 10.1-4 14.7-4.2.1 1.4.2 2.7.2 4z" />
    </svg>
  );
}

export interface CreateAccountProps {
  onBack: () => void;
  onNext: () => void;
}

export function CreateAccount({ onBack, onNext }: CreateAccountProps) {
  return (
    <div className={styles.screen}>
      <img className={styles.logo} src={logo} alt="FundRage" />
      <h1 className={styles.title}>Create an account</h1>
      <p className={styles.subtitle}>Save your topics, sources, and feed so they're here next time.</p>

      <button type="button" className={styles.appleButton} onClick={onNext}>
        <AppleLogo />
        Sign in with Apple
      </button>
      <p className={styles.note}>
        Backed by our real /auth/apple endpoint in production — mocked here since no Apple
        Developer/domain setup exists in this demo environment.
      </p>

      <div className={styles.spacer} />
      <button type="button" className={styles.backLink} onClick={onBack}>
        Back
      </button>
    </div>
  );
}
