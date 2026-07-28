import { ScreenHeader } from '../../components/ScreenHeader';
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
  onSeeNonprofits: () => void;
  onOpenAccount: () => void;
}

/**
 * Fresh build — the Figma "News Article" frame (node 1:2) is just a full-bleed
 * screenshot image with no real layout underneath it, nothing to port.
 */
export function ArticleDetail({ article, onBack, onSeeNonprofits, onOpenAccount }: ArticleDetailProps) {
  const topic = TOPICS_BY_ID.get(article.topicId);
  const source = SOURCES_BY_ID.get(article.sourceId);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Article" onProfileClick={onOpenAccount} />

      <div className={styles.content}>
        {topic && <img className={styles.hero} src={topic.photo} alt="" aria-hidden="true" />}
        {topic && <span className={styles.topicTag}>{topic.label}</span>}
        <h1 className={styles.headline}>{article.headline}</h1>
        <p className={styles.meta}>{source?.label ?? article.sourceId}</p>

        <div className={styles.body}>
          <p>
            This is where the full article would appear — either fetched and rendered in-app, or
            opened via an in-app browser view, depending on licensing/embedding terms with each
            source.
          </p>
        </div>

        <p className={styles.placeholderNote}>
          Mock content — no real article ingestion/rendering exists yet (that's Phase 2 per
          docs/fundrage-backend-spec.md §4.1–4.2).
        </p>
      </div>

      <NavFooter onBack={onBack} onNext={onSeeNonprofits} nextEnabled nextLabel="See Nonprofits" />
    </div>
  );
}
