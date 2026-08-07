import { OnboardingBottomNav } from '../../components/OnboardingBottomNav';
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
 * Matches Figma's "News-URL" frame (node-id=3069-4877): full-width photo, source pill,
 * large headline, summary text, and a "Read Article" call-to-action, with the red
 * Back/Find Causes bottom nav shared with the rest of the onboarding-styled flow.
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
      </div>

      <OnboardingBottomNav onBack={onBack} onNext={onSeeNonprofits} nextEnabled nextLabel="Find Causes" />
    </div>
  );
}
