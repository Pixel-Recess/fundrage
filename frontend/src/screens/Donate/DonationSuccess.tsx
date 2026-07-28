import { ScreenHeader } from '../../components/ScreenHeader';
import trophy from '../../assets/illustrations/welcome-trophy.png';
import styles from './DonationSuccess.module.css';

export interface DonationSuccessProps {
  nonprofitName: string;
  amount: number;
  onDone: () => void;
}

/**
 * Mocked confirmation — reuses Welcome's trophy/confetti illustration for continuity.
 * There's deliberately no fake "processing payment" step before this: in the real app the
 * charge happens on Every.org's side (Donate Link / Apple Pay), and this screen would only
 * ever appear once their webhook actually confirms it (see Donate.tsx's header comment).
 * A matching entry was added to Donation Receipts before landing here.
 */
export function DonationSuccess({ nonprofitName, amount, onDone }: DonationSuccessProps) {
  return (
    <div className={styles.screen}>
      <ScreenHeader title="Thank You!" showProfileIcon={false} />

      <div className={styles.content}>
        <img className={styles.illustration} src={trophy} alt="" aria-hidden="true" />
        <p className={styles.headline}>You just made a difference.</p>
        <p className={styles.body}>
          Your ${amount} donation to {nonprofitName} is on its way. A receipt is waiting for you
          in Donation Receipts.
        </p>
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.doneButton} onClick={onDone}>
          Done
        </button>
      </footer>
    </div>
  );
}
