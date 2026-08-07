import tail from '../../assets/brand/Talkbubble-Tail-White.svg';
import { HomeIcon } from '../../components/icons/HomeIcon';
import styles from './DonationSuccess.module.css';

export interface DonationSuccessProps {
  nonprofitName: string;
  amount: number;
  onDone: () => void;
}

/**
 * Matches Figma's "Thank You" frame (node-id=3161-7214) — the same talk-bubble card style
 * used by Welcome/Splash, on a full rage-200 background. There's deliberately no fake
 * "processing payment" step before this: in the real app the charge happens on Every.org's
 * side (Donate Link / Apple Pay), and this screen would only ever appear once their webhook
 * actually confirms it (see Donate.tsx's header comment). A matching entry was added to
 * Donation Receipts before landing here.
 */
export function DonationSuccess({ nonprofitName, amount, onDone }: DonationSuccessProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.talkBubble}>
        <div className={styles.textBox}>
          <p className={styles.bubbleText}>Thank you so much for your donation!</p>
        </div>
        <div className={styles.tailWrap}>
          <img className={styles.tail} src={tail} alt="" aria-hidden="true" />
        </div>
      </div>

      <p className={styles.body}>
        Because of your <strong>${amount}</strong> donation to <strong>{nonprofitName}</strong>,
        we’re one step closer to building a better world.
      </p>

      <div className={styles.spacer} />

      <footer className={styles.bottomNav}>
        <button type="button" className={styles.doneButton} onClick={onDone}>
          <HomeIcon size={18} />
          Back Home
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
