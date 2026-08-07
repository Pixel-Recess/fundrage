import logo from '../../assets/brand/Logotype-Bubble-White.svg';
import { AppleLogo } from '../../components/icons/AppleLogo';
import styles from './CreateAccount.module.css';

export interface CreateAccountProps {
  onBack: () => void;
  onNext: () => void;
  /** Mirrors Figma's Create-Account vs Create-Signin frames (node-id=3069-4635, 3069-4853) —
   *  same screen, different copy depending on whether the user is signing up or logging in. */
  mode?: 'create' | 'login';
}

export function CreateAccount({ onBack, onNext, mode = 'create' }: CreateAccountProps) {
  const isLogin = mode === 'login';
  return (
    <div className={styles.screen}>
      <img className={styles.logo} src={logo} alt="FundRage" />
      <h1 className={styles.title}>{isLogin ? 'Sign into your account' : 'Create an account'}</h1>
      <p className={styles.subtitle}>
        {isLogin
          ? 'Pick up right where you left off.'
          : "Save your topics, sources, and feed so they're here next time."}
      </p>

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
