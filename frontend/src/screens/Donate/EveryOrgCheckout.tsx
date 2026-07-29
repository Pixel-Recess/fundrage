import { NavFooter } from '../../components/NavFooter';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { AppleLogo } from '../../components/icons/AppleLogo';
import type { Nonprofit } from '../NonprofitsFromArticle/nonprofits';
import styles from './EveryOrgCheckout.module.css';

export interface EveryOrgCheckoutProps {
  nonprofit: Nonprofit;
  amount: number;
  onBack: () => void;
  onConfirm: () => void;
}

/**
 * Concept preview only — not a real integration. In production, Next on the Donate screen
 * hands off to an actual Every.org Donate Link, presented the same way a real news article
 * would be (an in-app browser sheet, see ArticleDetail's grabber/blurred-nav treatment, reused
 * here), rather than leaving the app entirely. There's no live every.org session behind this —
 * it's a plausible mock of that hand-off for early product feedback, per explicit request.
 */
export function EveryOrgCheckout({ nonprofit, amount, onBack, onConfirm }: EveryOrgCheckoutProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.grabber} aria-hidden="true" />
      <div className={styles.sheetNav}>
        <p className={styles.domain}>🔒 every.org</p>
        <button type="button" className={styles.closeButton} onClick={onBack} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <div className={styles.navSpacer} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.mockBanner}>
          Concept preview — no real payment is processed here. This is a mock of what handing off
          to Every.org's actual Donate Link/checkout could look like, embedded in-app rather than
          leaving FundRage.
        </p>

        <p className={styles.nonprofitName}>{nonprofit.name}</p>
        <p className={styles.frequencyLabel}>One-time donation</p>
        <p className={styles.amount}>${amount}</p>

        <button type="button" className={styles.payButton} disabled>
          <AppleLogo />
          Pay
        </button>
        <p className={styles.altPaymentsNote}>Card, PayPal, and Venmo also available on every.org</p>

        <div className={styles.spacer} />

        <p className={styles.trustFooter}>
          100% of your donation goes to {nonprofit.name}. A tax-deductible receipt is emailed
          after your gift. Payments securely processed by Every.org, a registered 501(c)(3) public
          charity.
        </p>
      </div>

      <NavFooter onBack={onBack} onNext={onConfirm} nextEnabled backLabel="Back" nextLabel="Simulate Donation" />
    </div>
  );
}
