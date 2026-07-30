import { NavFooter } from '../../components/NavFooter';
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
 * Preview card — thumbnail, source, headline, and a short summary — matching Figma's
 * "News-URL" sheet (node 3015:2653) and the tap-through pattern of apps like Ground News:
 * tap the card to open the full article in an in-app reader (ArticleReader), rather than
 * showing the whole body here. Presented as a sheet (rounded top corners + grabber) since
 * it's reached over the feed, not a primary nav screen.
 */
export function ArticleDetail({ article, onBack, onReadArticle, onSeeNonprofits }: ArticleDetailProps) {
  const topic = TOPICS_BY_ID.get(article.topicId);
  const source = SOURCES_BY_ID.get(article.sourceId);

  return (
    <div className={styles.screen}>
      <div className={styles.grabber} aria-hidden="true" />

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
        <button type="button" className={styles.card} onClick={onReadArticle}>
          {(article.thumbnailUrl ?? topic?.photo) && (
            <img
              className={styles.thumb}
              src={article.thumbnailUrl ?? topic?.photo}
              alt=""
              aria-hidden="true"
            />
          )}
          <h1 className={styles.headline}>{article.headline}</h1>
          <p className={styles.summary}>{article.preview}</p>
          <span className={styles.readArticleBadge}>Read Article</span>
        </button>
      </div>

      <NavFooter onBack={onBack} onNext={onSeeNonprofits} nextEnabled backLabel="Close" nextLabel="Find Causes" />
    </div>
  );
}
