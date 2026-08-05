import logo from '../../assets/brand/Logotype-Bubble-White.svg';
import { AppleLogo } from '../../components/icons/AppleLogo';
import styles from './CreateAccount.module.css';

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
