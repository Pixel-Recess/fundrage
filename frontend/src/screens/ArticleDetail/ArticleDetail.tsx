import { NavFooter } from '../../components/NavFooter';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { TOPICS } from '../TopicSelection/topics';
import type { Article } from '../Feed/articles';
import styles from './ArticleDetail.module.css';

const TOPICS_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

export interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onSeeNonprofits: () => void;
}

/**
 * Modeled on Figma's "News-URL" modal-sheet frame (node 3015:2653) — a presented sheet
 * previewing the source article, not a primary nav screen, so there's no ScreenHeader/profile
 * icon here. We don't have real per-article webpage screenshots to embed, so the topic's own
 * illustration stands in for the preview image, same mocking convention used elsewhere in the
 * demo. "Read Article" stays disabled — no real article content/URL exists yet (Phase 2 per
 * docs/fundrage-backend-spec.md §4.1–4.2), same convention as Donate's disabled website button.
 */
export function ArticleDetail({ article, onBack, onSeeNonprofits }: ArticleDetailProps) {
  const topic = TOPICS_BY_ID.get(article.topicId);

  return (
    <div className={styles.screen}>
      <div className={styles.grabber} aria-hidden="true" />
      <div className={styles.sheetNav}>
        <p className={styles.navTitle}>{article.headline}</p>
        <button type="button" className={styles.closeButton} onClick={onBack} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <div className={styles.navSpacer} aria-hidden="true" />

      <div className={styles.previewArea}>
        {topic && <img className={styles.previewImage} src={topic.photo} alt="" aria-hidden="true" />}
        <div className={styles.gradientOverlay} aria-hidden="true" />
        <button type="button" className={styles.readArticleButton} disabled>
          Read Article
        </button>
      </div>

      <NavFooter onBack={onBack} onNext={onSeeNonprofits} nextEnabled backLabel="Close" nextLabel="Find Causes" />
    </div>
  );
}
