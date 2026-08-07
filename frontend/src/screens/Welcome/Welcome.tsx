import { OnboardingBottomNav } from '../../components/OnboardingBottomNav';
import tail from '../../assets/brand/Talkbubble-Tail-White.svg';
import styles from './Welcome.module.css';

export interface WelcomeProps {
  onBack: () => void;
  onNext: () => void;
}

/**
 * Mirrors Onboarding5 in the Figma prototype (node-id=3069-4295) — a talk-bubble card
 * (same style as the intro carousel's) over a full rage-200 background, replacing the old
 * white-background/trophy-illustration version. Copy is verbatim from the frame.
 */
export function Welcome({ onBack, onNext }: WelcomeProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.talkBubble}>
        <div className={styles.textBox}>
          <p className={styles.bubbleText}>
            <strong>Congratulations!</strong> You’re all done!{' '}
          </p>
        </div>
        <div className={styles.tailWrap}>
          <img className={styles.tail} src={tail} alt="" aria-hidden="true" />
        </div>
      </div>

      <p className={styles.body}>
        Now it’s time start giving. But first you need to save all this work and create an account.
      </p>

      <div className={styles.spacer} />

      <OnboardingBottomNav onBack={onBack} onNext={onNext} nextEnabled nextLabel="Create Account" />
    </div>
  );
}
