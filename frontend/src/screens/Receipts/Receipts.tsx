import { ScreenHeader } from '../../components/ScreenHeader';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import emptyIllustration from '../../assets/illustrations/receipts-empty.png';
import type { Receipt } from './receiptsData';
import styles from './Receipts.module.css';

export interface ReceiptsProps {
  receipts: Receipt[];
  onBack: () => void;
  onSelectReceipt: (receipt: Receipt) => void;
}

/**
 * Built from Figma's "Receipts - Empty" (55:2291) and "Receipts" (85:2061) frames. Receipts
 * are owned by App.tsx (starting from receiptsData.ts's mock list, seeded so this list state
 * is visible by default) rather than imported statically here, since completing a mock
 * donation (see Donate.tsx) appends a new one.
 */
export function Receipts({ receipts, onBack, onSelectReceipt }: ReceiptsProps) {
  return (
    <div className={styles.screen}>
      <ScreenHeader title="Donation Receipts" showProfileIcon={false} />

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
                    {receipt.date}
                    <span className={styles.dot}>•</span>
                    {receipt.cardLabel}
                  </span>
                </span>
                <span className={styles.rowRight}>
                  <span className={styles.rowAmount}>${receipt.amount}</span>
                  <ChevronRightIcon />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className={styles.backFooter}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
      </footer>
      <div className={styles.footerSpacer} aria-hidden="true" />
    </div>
  );
}
