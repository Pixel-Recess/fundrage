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
 * The full in-app read view reached by tapping through from ArticleDetail's preview card —
 * mock body text only, no real article ingestion/rendering yet (Phase 2 per
 * docs/fundrage-backend-spec.md §4.1–4.2).
 */
export function ArticleReader({ article, onBack, onSeeNonprofits }: ArticleReaderProps) {
  const topic = TOPICS_BY_ID.get(article.topicId);
  const source = SOURCES_BY_ID.get(article.sourceId);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Article" showProfileIcon={false} />

      <div className={styles.content}>
        {source && <span className={styles.sourcePill}>{source.label}</span>}
        {topic && <img className={styles.thumb} src={topic.photo} alt="" aria-hidden="true" />}
        <h1 className={styles.headline}>{article.headline}</h1>
        <div className={styles.body}>
          {article.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      <NavFooter onBack={onBack} onNext={onSeeNonprofits} nextEnabled nextLabel="Find Causes" />
    </div>
  );
}
