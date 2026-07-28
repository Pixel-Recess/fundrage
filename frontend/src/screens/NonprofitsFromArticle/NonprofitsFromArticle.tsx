import { ScreenHeader } from '../../components/ScreenHeader';
import { getNonprofitsForTopic, type Nonprofit } from './nonprofits';
import styles from './NonprofitsFromArticle.module.css';

export interface NonprofitsFromArticleProps {
  topicId: string;
  onBack: () => void;
  onSelectNonprofit: (nonprofit: Nonprofit) => void;
  onOpenAccount: () => void;
}

/**
 * Loosely based on the Figma "Nonprofits - From Article" frame (node 147:1864).
 * Simplified from that frame: no search bar or location filter (search-for-a-
 * nonprofit is real functionality that doesn't exist yet), and the alert copy
 * is rewritten to match the actual spec threshold (Charity Navigator >= 75,
 * not "3-stars") since that's the real non-negotiable filter (spec §4.4).
 */
export function NonprofitsFromArticle({
  topicId,
  onBack,
  onSelectNonprofit,
  onOpenAccount,
}: NonprofitsFromArticleProps) {
  const nonprofits = getNonprofitsForTopic(topicId);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Choose a nonprofit" onProfileClick={onOpenAccount} />

      <div className={styles.content}>
        <p className={styles.alert}>
          FundRage only suggests 501(c)(3) nonprofits rated 75+ on Charity Navigator and verified
          for Apple Pay eligibility.
        </p>

        <div className={styles.list} role="list" aria-label="Matched nonprofits">
          {nonprofits.length === 0 && (
            <p className={styles.empty}>No matched nonprofits for this topic yet.</p>
          )}
          {nonprofits.map((nonprofit) => (
            <button
              type="button"
              key={nonprofit.id}
              className={styles.row}
              onClick={() => onSelectNonprofit(nonprofit)}
            >
              <div className={styles.rowText}>
                <p className={styles.rowName}>{nonprofit.name}</p>
                <p className={styles.rowDescription}>{nonprofit.description}</p>
              </div>
              <span className={styles.chevron} aria-hidden="true">
                ›
              </span>
            </button>
          ))}
        </div>
      </div>

      <footer className={styles.backFooter}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
      </footer>
    </div>
  );
}
