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
 * Matches Figma's "Simulation" frame (node-id=3161-7214) — mist-100 background, a single
 * white card combining the amount/frequency and trust copy, and the same white bottom nav
 * style as Donate. Concept preview only — not a real integration. In production, Next on the
 * Donate screen hands off to an actual Every.org Donate Link; there's no live every.org
 * session behind this screen, it's a plausible mock of that hand-off for early product
 * feedback, per explicit request — the mock banner keeps that honest per CLAUDE.md even
 * though the Figma frame itself doesn't show one.
 */
export function EveryOrgCheckout({ nonprofit, amount, onBack, onConfirm }: EveryOrgCheckoutProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <p className={styles.mockBanner}>
          Concept preview — no real payment is processed here. This is a mock of what handing off
          to Every.org's actual Donate Link/checkout could look like.
        </p>

        <p className={styles.sectionHeader}>{nonprofit.name}</p>

        <div className={styles.card}>
          <div className={styles.head}>
            <div className={styles.amountBox}>${amount}</div>
            <p className={styles.frequencyLabel}>One time donation</p>
          </div>
          <p className={styles.trustBody}>
            100% of your donation goes to {nonprofit.name}. A tax-deductible receipt is emailed
            after your gift. Payments securely processed by Every.org a registered 501(c)(3)
            public charity.
          </p>
        </div>

        <button type="button" className={styles.payButton} disabled>
          <AppleLogo />
          Pay
        </button>
      </div>

      <footer className={styles.bottomNav}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <button type="button" className={styles.simulateButton} onClick={onConfirm}>
          Simulate
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
