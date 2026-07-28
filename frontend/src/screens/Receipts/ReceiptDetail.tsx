import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmailIcon } from '../../components/icons/EmailIcon';
import type { Receipt } from './receiptsData';
import styles from './ReceiptDetail.module.css';

export interface ReceiptDetailProps {
  receipt: Receipt;
  /** Prefills the email field — the user's own address from their profile. */
  profileEmail: string;
  onBack: () => void;
}

/**
 * Built from Figma's "Receipt - View" (57:1049) and "Receipt - Email success" (85:2765)
 * frames — merged into one component with local state for the success alert, same
 * pattern as Profile/Contact's toast. Skips the Mastercard network logo image Figma
 * embeds (a registered trademark, not worth reproducing for a demo) — the card label
 * text alone ("Mastercard ending in 4444") already carries the same information.
 * That label mocks what Apple Pay's PKPaymentToken surfaces for a receipt display;
 * FundRage never sees or stores real card data (CLAUDE.md §1).
 */
export function ReceiptDetail({ receipt, profileEmail, onBack }: ReceiptDetailProps) {
  const [email, setEmail] = useState(profileEmail);
  const [sent, setSent] = useState(false);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Receipt" showProfileIcon={false} />

      <div className={styles.content}>
        <div className={styles.payRow}>
          <div className={styles.payee}>
            <p className={styles.payeeName}>{receipt.nonprofitName}</p>
            <p className={styles.payeeDate}>{receipt.date}</p>
          </div>
          <div className={styles.amountBadge}>${receipt.amount}</div>
        </div>

        <div className={styles.cardRow}>
          <span className={styles.cardChip} aria-hidden="true" />
          <p className={styles.cardLabel}>{receipt.cardLabel}</p>
        </div>
        <p className={styles.cardExpiry}>
          Expires <strong>{receipt.cardExpiry}</strong>
        </p>

        <p className={styles.sectionLabel}>Email this receipt</p>
        <p className={styles.sectionBody}>
          Need a receipt for your records? We'll send one to you! Enter a valid email address
          below.
        </p>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email address</span>
          <span className={styles.fieldBox}>
            <span className={styles.fieldIcon}>
              <EmailIcon />
            </span>
            <input
              className={styles.fieldInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </span>
        </label>

        <button type="button" className={styles.emailButton} onClick={() => setSent(true)}>
          Email Receipt
        </button>
      </div>

      <footer className={styles.backFooter}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
      </footer>

      {sent && (
        <div className={styles.toastBackdrop} role="alert">
          <div className={styles.toast}>
            <p className={styles.toastTitle}>Success!</p>
            <p className={styles.toastBody}>A receipt for this donation was sent to “{email}”.</p>
            <button type="button" className={styles.toastClose} onClick={() => setSent(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
