import { useEffect, useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { getNonprofitsForTopic, type Nonprofit } from './nonprofits';
import { fetchLiveCharities } from '../../api';
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
 *
 * Tries the real /dev/charities endpoint first (real nonprofit names from Every.org's public
 * search API — see src/routes/live.ts on the backend); falls back to the local mock list on
 * any failure. Real results are NOT independently checked against Charity Navigator's ≥75
 * threshold in this demo — the alert copy is adjusted to say so when live data is showing.
 */
export function NonprofitsFromArticle({
  topicId,
  onBack,
  onSelectNonprofit,
  onOpenAccount,
}: NonprofitsFromArticleProps) {
  const [liveNonprofits, setLiveNonprofits] = useState<Nonprofit[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveCharities(topicId)
      .then((liveResults) => {
        if (cancelled) return;
        setLiveNonprofits(
          liveResults.map((live) => ({
            id: live.id,
            name: live.name,
            description: live.description,
            topicIds: [topicId],
            live: true,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setLiveNonprofits(null);
      });
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const nonprofits = liveNonprofits ?? getNonprofitsForTopic(topicId);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Choose a nonprofit" onProfileClick={onOpenAccount} />

      <div className={styles.content}>
        <p className={styles.alert}>
          {liveNonprofits
            ? 'Real 501(c)(3) nonprofits from Every.org — Charity Navigator rating isn’t independently verified in this demo.'
            : 'FundRage only suggests 501(c)(3) nonprofits rated 75+ on Charity Navigator and verified for Apple Pay eligibility.'}
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
      <div className={styles.footerSpacer} aria-hidden="true" />
    </div>
  );
}
