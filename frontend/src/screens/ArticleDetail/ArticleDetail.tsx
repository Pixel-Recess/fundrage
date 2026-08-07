import { OpenInNewIcon } from '../../components/icons/OpenInNewIcon';
import { TOPICS } from '../TopicSelection/topics';
import { SOURCES } from '../SourceSelection/sources';
import type { Article } from '../Feed/articles';
import styles from './ArticleDetail.module.css';

const TOPICS_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));
const SOURCES_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onReadArticle: () => void;
  onSeeNonprofits: () => void;
}

/**
 * Matches Figma's "News-URL" frame (node-id=3069-4877): full-width photo, source pill, large
 * headline, summary text fading into a black gradient with a centered "Read Article" button
 * on top of it, and the white Back/Find Causes bottom nav shared with Donate/EveryOrgCheckout.
 */
export function ArticleDetail({ article, onBack, onReadArticle, onSeeNonprofits }: ArticleDetailProps) {
  const topic = TOPICS_BY_ID.get(article.topicId);
  const source = SOURCES_BY_ID.get(article.sourceId);

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        {(article.thumbnailUrl ?? topic?.photo) && (
          <img
            className={styles.thumb}
            src={article.thumbnailUrl ?? topic?.photo}
            alt=""
            aria-hidden="true"
          />
        )}
        {source && <span className={styles.sourcePill}>{source.label}</span>}
        <h1 className={styles.headline}>{article.headline}</h1>
        <p className={styles.summary}>{article.preview}</p>
      </div>

      <div className={styles.fadeOverlay} aria-hidden="true" />
      {article.live && article.canonicalUrl ? (
        <a
          className={styles.readArticleButton}
          href={article.canonicalUrl}
          target="_blank"
          rel="noreferrer"
        >
          Read Article
          <OpenInNewIcon size={14} />
        </a>
      ) : (
        <button type="button" className={styles.readArticleButton} onClick={onReadArticle}>
          Read Article
        </button>
      )}

      <footer className={styles.bottomNav}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <button type="button" className={styles.findCausesButton} onClick={onSeeNonprofits}>
          Find Causes
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
