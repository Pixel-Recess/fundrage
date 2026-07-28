import { ScreenHeader } from '../../components/ScreenHeader';
import { NavFooter } from '../../components/NavFooter';
import trophy from '../../assets/illustrations/welcome-trophy.png';
import styles from './Welcome.module.css';

export interface WelcomeProps {
  onBack: () => void;
  onNext: () => void;
}

/**
 * Ported from Figma's "Thank You" frame (66:1226) — but that frame's copy
 * ("Thank you for creating an account with Fundrage.") only makes sense
 * *after* Create Account, not before it. Per explicit direction, this screen
 * sits before Create Account instead, so the copy is rewritten as a
 * pre-signup "nice work, here's what's next" moment instead of a post-signup
 * thank-you — everything else (header style, trophy/confetti illustration,
 * "Time to get giving." line) is carried over as-is.
 */
export function Welcome({ onBack, onNext }: WelcomeProps) {
  return (
    <div className={styles.screen}>
      <ScreenHeader title="You're All Set" showProfileIcon={false} />

      <div className={styles.content}>
        <p className={styles.intro}>You've picked your topics and news sources — nice work.</p>
        <img className={styles.illustration} src={trophy} alt="" aria-hidden="true" />
        <p className={styles.headline}>Time to get giving.</p>
      </div>

      <NavFooter onBack={onBack} onNext={onNext} nextEnabled nextLabel="Continue" />
    </div>
  );
}
