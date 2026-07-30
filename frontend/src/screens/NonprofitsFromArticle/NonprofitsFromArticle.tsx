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

function NonprofitsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div className={styles.row} key={i}>
          <div className={styles.rowText}>
            <div className={`${styles.skeletonLine} ${styles.skeletonName}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonDescription}`} />
          </div>
          <span className={styles.chevron} aria-hidden="true">
            ›
          </span>
        </div>
      ))}
    </>
  );
}

/**
 * Loosely based on the Figma "Nonprofits - From Article" frame (node 147:1864).
 * Simplified from that frame: no search bar or location filter (search-for-a-
 * nonprofit is real functionality that doesn't exist yet), and the alert copy
 * is rewritten to match the actual spec threshold (Charity Navigator >= 75,
 * not "3-stars") since that's the real non-negotiable filter (spec §4.4).
 *
 * Tries the real /dev/charities endpoint first (real nonprofit names from Every.org's public
 * search API — see src/routes/live.ts on the backend). Shows a skeleton loading state (same
 * pattern as Feed's, matching Figma's "News-Loading" frame) while the request is in flight,
 * instead of flashing the mock list before swapping to live data. Falls back to the mock list
 * only if the live fetch actually fails. Real results are NOT independently checked against
 * Charity Navigator's ≥75 threshold in this demo — the alert copy is adjusted to say so when
 * live data is showing.
 */
export function NonprofitsFromArticle({
  topicId,
  onBack,
  onSelectNonprofit,
  onOpenAccount,
}: NonprofitsFromArticleProps) {
  const [status, setStatus] = useState<'loading' | 'live' | 'mock'>('loading');
  const [liveNonprofits, setLiveNonprofits] = useState<Nonprofit[]>([]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
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
        setStatus('live');
      })
      .catch(() => {
        if (!cancelled) setStatus('mock');
      });
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const nonprofits = status === 'live' ? liveNonprofits : getNonprofitsForTopic(topicId);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Choose a nonprofit" onProfileClick={onOpenAccount} />

      <div className={styles.content}>
        <p className={styles.alert}>
          {status === 'live'
            ? 'Real 501(c)(3) nonprofits from Every.org — Charity Navigator rating isn’t independently verified in this demo.'
            : 'FundRage only suggests 501(c)(3) nonprofits rated 75+ on Charity Navigator and verified for Apple Pay eligibility.'}
        </p>

        <div className={styles.list} role="list" aria-label="Matched nonprofits">
          {status === 'loading' ? (
            <NonprofitsSkeleton />
          ) : (
            <>
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
            </>
          )}
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
