import { ScreenHeader } from '../../components/ScreenHeader';
import { TOPICS } from '../TopicSelection/topics';
import { SOURCES } from '../SourceSelection/sources';
import { ARTICLES, type Article } from './articles';
import styles from './Feed.module.css';

const SOURCES_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export interface FeedProps {
  selectedTopicIds: string[];
  onSelectArticle: (article: Article) => void;
  onOpenAccount: () => void;
}

export function Feed({ selectedTopicIds, onSelectArticle, onOpenAccount }: FeedProps) {
  const topicIds = new Set(selectedTopicIds);
  // Filtered by topic only — source selection isn't a display filter here since
  // in the real backend, source_slugs describe where ingestion detects a story,
  // not a per-user feed filter (see docs/fundrage-backend-spec.md §4.1).
  const articlesByTopic = new Map<string, Article[]>();
  for (const article of ARTICLES) {
    if (!topicIds.has(article.topicId)) continue;
    const list = articlesByTopic.get(article.topicId) ?? [];
    list.push(article);
    articlesByTopic.set(article.topicId, list);
  }
  // TOPICS order (not selection order or article order) so sections appear in a
  // stable, predictable sequence every time.
  const sections = TOPICS.filter((topic) => articlesByTopic.has(topic.id));

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Your Feed" onProfileClick={onOpenAccount} />

      <div className={styles.list} role="feed" aria-label="Your personalized feed">
        {sections.length === 0 && (
          <p className={styles.empty}>No matching stories yet for the topics you picked.</p>
        )}
        {sections.map((topic) => (
          <div className={styles.section} key={topic.id}>
            <p className={styles.sectionHeader}>{topic.label}</p>
            {articlesByTopic.get(topic.id)!.map((article) => {
              const source = SOURCES_BY_ID.get(article.sourceId);
              return (
                <button
                  type="button"
                  className={styles.card}
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                >
                  <img className={styles.thumb} src={topic.photo} alt="" aria-hidden="true" />
                  <div className={styles.cardBody}>
                    <p className={styles.headline}>{article.headline}</p>
                    <p className={styles.preview}>{article.preview}</p>
                    <span className={styles.sourcePill}>{source?.label ?? article.sourceId}</span>
                  </div>
                  <span className={styles.chevron} aria-hidden="true">
                    ›
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
