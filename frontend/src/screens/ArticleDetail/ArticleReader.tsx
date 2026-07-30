import { ScreenHeader } from '../../components/ScreenHeader';
import { NavFooter } from '../../components/NavFooter';
import { TOPICS } from '../TopicSelection/topics';
import { SOURCES } from '../SourceSelection/sources';
import type { Article } from '../Feed/articles';
import styles from './ArticleReader.module.css';

const TOPICS_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));
const SOURCES_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export interface ArticleReaderProps {
  article: Article;
  onBack: () => void;
  onSeeNonprofits: () => void;
}

/**
 * The full in-app read view reached by tapping through from ArticleDetail's preview card. For
 * mock articles this shows placeholder body text — no real ingestion/rendering yet (Phase 2 per
 * docs/fundrage-backend-spec.md §4.1–4.2). For real articles fetched from /dev/news, only a real
 * headline/summary exists (RSS feeds don't provide full body text, and scraping publisher pages
 * to fake it isn't something CLAUDE.md wants coded around) — so instead of fake paragraphs, this
 * shows the real summary plus a real link to the original article.
 */
export function ArticleReader({ article, onBack, onSeeNonprofits }: ArticleReaderProps) {
  const topic = TOPICS_BY_ID.get(article.topicId);
  const source = SOURCES_BY_ID.get(article.sourceId);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Article" showProfileIcon={false} />

      <div className={styles.content}>
        <div className={styles.metaRow}>
          {source && <span className={styles.sourcePill}>{source.label}</span>}
          {article.publishedAt && (
            <span className={styles.dateLabel}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
        {(article.thumbnailUrl ?? topic?.photo) && (
          <img
            className={styles.thumb}
            src={article.thumbnailUrl ?? topic?.photo}
            alt=""
            aria-hidden="true"
          />
        )}
        <h1 className={styles.headline}>{article.headline}</h1>
        {article.live ? (
          <>
            <p className={styles.liveNote}>
              This is a real headline and summary — full article text isn’t part of this demo
              (that requires real licensed ingestion, Phase 2). Read the original below.
            </p>
            <div className={styles.body}>
              <p>{article.preview}</p>
            </div>
            {article.canonicalUrl && (
              <a
                className={styles.originalLink}
                href={article.canonicalUrl}
                target="_blank"
                rel="noreferrer"
              >
                Read original article ↗
              </a>
            )}
          </>
        ) : (
          <div className={styles.body}>
            {article.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>

      <NavFooter onBack={onBack} onNext={onSeeNonprofits} nextEnabled nextLabel="Find Causes" />
    </div>
  );
}
