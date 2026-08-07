import { ScreenHeader } from '../../components/ScreenHeader';
import emptyIllustration from '../../assets/illustrations/receipts-empty.png';
import type { Receipt } from './receiptsData';
import styles from './Receipts.module.css';

export interface ReceiptsProps {
  receipts: Receipt[];
  onBack: () => void;
  onSelectReceipt: (receipt: Receipt) => void;
}

/**
 * Matches Figma's "Receipts" frame (node-id=3320-11516) — white header, mist-100
 * background, and white rounded-6 receipt cards following the same pattern as
 * Feed/Donate. Receipts are owned by App.tsx (starting from receiptsData.ts's mock list,
 * seeded so this list state is visible by default) rather than imported statically here,
 * since completing a mock donation (see Donate.tsx) appends a new one.
 */
export function Receipts({ receipts, onBack, onSelectReceipt }: ReceiptsProps) {
  return (
    <div className={styles.screen}>
      <ScreenHeader title="Donation Receipts" showProfileIcon={false} variant="white" />

      <div className={styles.content}>
        {receipts.length === 0 ? (
          <div className={styles.empty}>
            <img className={styles.emptyIllustration} src={emptyIllustration} alt="" aria-hidden="true" />
            <p className={styles.emptyText}>
              None here yet! Once you make your first donation, you'll see your receipts here.
            </p>
          </div>
        ) : (
          <div className={styles.list} role="list" aria-label="Donation receipts">
            {receipts.map((receipt) => (
              <button
                type="button"
                key={receipt.id}
                className={styles.row}
                onClick={() => onSelectReceipt(receipt)}
              >
                <span className={styles.rowText}>
                  <span className={styles.rowName}>{receipt.nonprofitName}</span>
                  <span className={styles.rowDetails}>
                    <span className={styles.rowDate}>{receipt.date}</span>
                    <span>{receipt.cardLabel}</span>
                  </span>
                </span>
                <span className={styles.rowAmount}>${receipt.amount}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className={styles.bottomNav}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
