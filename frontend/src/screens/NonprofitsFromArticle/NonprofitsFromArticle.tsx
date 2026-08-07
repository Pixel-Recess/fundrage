import { useEffect, useState } from 'react';
import { TOPICS } from '../TopicSelection/topics';
import { getNonprofitsForTopic, type Nonprofit } from './nonprofits';
import { fetchLiveCharities } from '../../api';
import styles from './NonprofitsFromArticle.module.css';

const TOPICS_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));
const DISMISS_ANIMATION_MS = 250;

export interface NonprofitsFromArticleProps {
  topicId: string;
  onBack: () => void;
  onSelectNonprofit: (nonprofit: Nonprofit) => void;
}

function NonprofitsSkeleton() {
  return (
    <>
      <p className={styles.sectionHeader}>Loading...</p>
      {[0, 1, 2].map((i) => (
        <div className={styles.row} key={i}>
          <div className={styles.rowText}>
            <div className={styles.skeletonTitleGroup}>
              <div className={`${styles.skeletonLine} ${styles.skeletonName}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonNameSecond}`} />
            </div>
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
 * Matches Figma's "Nonprofit-Loading"/"Nonprofit" frames (node-id=3161-6717, 3161-6877) — an
 * iOS-style slide-up sheet (dimmed backdrop + white rounded-top tray) over whatever screen it
 * was opened from, instead of a full-screen route. Tapping the backdrop dismisses it, same as
 * a native sheet.
 *
 * Tries the real /dev/charities endpoint first (real nonprofit names from Every.org's public
 * search API — see src/routes/live.ts on the backend). Shows a skeleton loading state while the
 * request is in flight, instead of flashing the mock list before swapping to live data. Falls
 * back to the mock list only if the live fetch actually fails. Real results are NOT
 * independently checked against Charity Navigator's ≥75 threshold in this demo — the alert copy
 * is adjusted to say so when live data is showing.
 */
export function NonprofitsFromArticle({ topicId, onBack, onSelectNonprofit }: NonprofitsFromArticleProps) {
  const [status, setStatus] = useState<'loading' | 'live' | 'mock'>('loading');
  const [liveNonprofits, setLiveNonprofits] = useState<Nonprofit[]>([]);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1000));
    Promise.all([fetchLiveCharities(topicId).catch(() => null), minDelay]).then(
      ([liveResults]) => {
        if (cancelled) return;
        if (!liveResults) {
          setStatus('mock');
          return;
        }
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
      },
    );
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const nonprofits = status === 'live' ? liveNonprofits : getNonprofitsForTopic(topicId);
  const topicLabel = TOPICS_BY_ID.get(topicId)?.label ?? 'Matched Nonprofits';

  function handleDismiss() {
    if (closing) return;
    setClosing(true);
    setTimeout(onBack, DISMISS_ANIMATION_MS);
  }

  return (
    <div
      className={`${styles.backdrop} ${closing ? styles.backdropClosing : ''}`}
      onClick={handleDismiss}
      role="presentation"
    >
      <div
        className={`${styles.sheet} ${closing ? styles.sheetClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Matched nonprofits"
      >
        <div className={styles.grabber} aria-hidden="true" />
        <div className={styles.content}>
          <p className={styles.alert}>
            {status === 'live'
              ? 'Real 501(c)(3) nonprofits from Every.org — Charity Navigator rating isn’t independently verified in this demo.'
              : 'FundRage only suggests 501(c)(3) nonprofits rated 75+ on Charity Navigator and verified for Apple Pay eligibility.'}
          </p>

          {status === 'loading' ? (
            <NonprofitsSkeleton />
          ) : (
            <>
              <p className={styles.sectionHeader}>{topicLabel}</p>
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
    </div>
  );
}
