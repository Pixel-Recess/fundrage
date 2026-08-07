import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StarIcon } from '../../components/icons/StarIcon';
import { OpenInNewIcon } from '../../components/icons/OpenInNewIcon';
import checkBadge from '../../assets/icons/check-badge.svg';
import type { Nonprofit } from '../NonprofitsFromArticle/nonprofits';
import styles from './Donate.module.css';

export interface DonateProps {
  nonprofit: Nonprofit;
  onBack: () => void;
  onNext: (amount: number) => void;
}

const PRESET_AMOUNTS = [5, 10, 25];
// All mock nonprofits already pass the real spec threshold (Charity Navigator >= 75, spec
// §4.4) by construction (see nonprofits.ts) — this fixed 97%/4-star display is a simplification
// of that, not a claim about a specific real rating.
const MOCK_RATING_PERCENT = 97;

/**
 * Matches Figma's "Donate" frame (node-id=3161-6962) — mist-100 background, a combined
 * amount-picker/custom-amount card, a separate rating/details card, and a white bottom nav
 * with an aqua-300 "Donate Now" button. Only ever collects an amount — no payment fields, no
 * card entry — because in the real app, Next hands off to an Every.org Donate Link (or Apple
 * Pay via their flow); the actual charge happens entirely outside FundRage, and confirmation
 * comes back later via Every.org's webhook (CLAUDE.md §1). Building an in-app "enter your
 * card" step here would be a pattern that can't be replicated once this is wired to a real
 * backend, so this demo skips straight from Next to a mocked success screen instead (see
 * DonationSuccess) rather than inventing one.
 */
export function Donate({ nonprofit, onBack, onNext }: DonateProps) {
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState('');

  function selectPreset(value: number) {
    setAmount(value);
    setCustomAmount('');
  }

  function handleCustomChange(value: string) {
    setCustomAmount(value);
    const parsed = parseFloat(value);
    setAmount(!Number.isNaN(parsed) && parsed > 0 ? parsed : 0);
  }

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Donate" showProfileIcon={false} />

      <div className={styles.content}>
        <p className={styles.sectionHeader}>{nonprofit.name}</p>

        <div className={styles.card}>
          <div className={styles.amounts}>
            {PRESET_AMOUNTS.map((value) => {
              const isSelected = customAmount === '' && amount === value;
              return (
                <button
                  type="button"
                  key={value}
                  className={`${styles.amountButton} ${isSelected ? styles.amountButtonSelected : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => selectPreset(value)}
                >
                  ${value}
                  {isSelected && (
                    <img className={styles.checkBadge} src={checkBadge} alt="" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Enter other amount</span>
            <span className={styles.fieldBox}>
              <span className={styles.dollarSign}>$</span>
              <input
                className={styles.fieldInput}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
              />
            </span>
          </label>
        </div>

        <div className={styles.detailsCard}>
          <p className={styles.ratingCaption}>Charity Navigator Rating</p>
          <div className={styles.ratingRow}>
            <span className={styles.stars}>
              {Array.from({ length: 4 }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </span>
            <span className={styles.ratingPercent}>{MOCK_RATING_PERCENT}%</span>
          </div>
          <p className={styles.detailsBody}>
            Want to learn more about {nonprofit.name}? Tap the button below to open their website
            and discover more.
          </p>
          {/* No real per-nonprofit website exists in this mock data — matches the FAQs/User
              Agreement rows on Account, which are also non-functional external links. */}
          <button type="button" className={styles.websiteButton} disabled>
            Visit Website
            <OpenInNewIcon size={12} />
          </button>
        </div>
      </div>

      <footer className={styles.bottomNav}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className={styles.donateButton}
          disabled={amount <= 0}
          onClick={() => onNext(amount)}
        >
          Donate Now
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
