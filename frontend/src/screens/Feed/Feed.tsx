import { useEffect, useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TOPICS } from '../TopicSelection/topics';
import { SOURCES } from '../SourceSelection/sources';
import { ARTICLES, type Article } from './articles';
import { fetchLiveNews } from '../../api';
import styles from './Feed.module.css';

const SOURCES_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export interface FeedProps {
  selectedTopicIds: string[];
  onSelectArticle: (article: Article) => void;
  onOpenAccount: () => void;
}

/**
 * Tries the real /dev/news endpoint first (real RSS headlines/summaries — see
 * src/routes/live.ts on the backend); falls back to the local ARTICLES mock on any failure
 * (no VITE_API_BASE_URL configured, network error, etc.) so the demo never goes blank. A live
 * article can match more than one selected topic (matchedTopics), so it's fanned out into one
 * card per matched section, same as how a real Ground-News-style feed would surface it under
 * each topic the reader cares about.
 */
export function Feed({ selectedTopicIds, onSelectArticle, onOpenAccount }: FeedProps) {
  const [liveArticles, setLiveArticles] = useState<Article[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveNews(selectedTopicIds)
      .then((liveResults) => {
        if (cancelled) return;
        const fannedOut: Article[] = liveResults.flatMap((live) =>
          (live.matchedTopics.length > 0 ? live.matchedTopics : ['unmatched']).map((topicId) => ({
            id: `live-${topicId}-${live.canonicalUrl}`,
            headline: live.headline,
            preview: live.summary,
            body: [live.summary],
            topicId,
            sourceId: live.sourceSlug,
            live: true,
            canonicalUrl: live.canonicalUrl,
            thumbnailUrl: live.imageUrl ?? undefined,
            publishedAt: live.publishedAt,
          })),
        );
        setLiveArticles(fannedOut);
      })
      .catch(() => {
        if (!cancelled) setLiveArticles(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTopicIds]);

  const articles = liveArticles ?? ARTICLES;
  const topicIds = new Set(selectedTopicIds);
  // Filtered by topic only — source selection isn't a display filter here since
  // in the real backend, source_slugs describe where ingestion detects a story,
  // not a per-user feed filter (see docs/fundrage-backend-spec.md §4.1).
  const articlesByTopic = new Map<string, Article[]>();
  for (const article of articles) {
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
        {liveArticles && (
          <p className={styles.liveBadge}>Showing real headlines — experimental, see CLAUDE.md</p>
        )}
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
                  <img
                    className={styles.thumb}
                    src={article.thumbnailUrl ?? topic.photo}
                    alt=""
                    aria-hidden="true"
                  />
                  <div className={styles.cardBody}>
                    <p className={styles.headline}>{article.headline}</p>
                    {article.publishedAt && (
                      <p className={styles.dateLabel}>
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
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
