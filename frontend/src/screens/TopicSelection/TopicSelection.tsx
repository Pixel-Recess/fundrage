import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { OnboardingBottomNav } from '../../components/OnboardingBottomNav';
import checkMark from '../../assets/icons/check-mark.svg';
import { TOPICS } from './topics';
import styles from './TopicSelection.module.css';

export interface TopicSelectionProps {
  /** Fills the "What's making you [mood]?" header — carried over from the mood-capture screen. */
  mood: string;
  /** Called when the user taps Back. */
  onBack: () => void;
  /** Called with the selected topic ids when the user taps Next (only reachable once enabled). */
  onNext: (selectedTopicIds: string[]) => void;
  /** Pre-checks these topics — used when reopened from Settings to edit an existing selection. */
  initialSelectedIds?: string[];
  /** Overrides the header title (Settings uses "Your Topics" instead of the mood prompt). */
  title?: string;
  /** Overrides the footer's Next-button label (Settings uses a static "Save"). */
  nextLabel?: string;
}

export function TopicSelection({
  mood,
  onBack,
  onNext,
  initialSelectedIds,
  title,
  nextLabel,
}: TopicSelectionProps) {
  const [initialSelected] = useState<Set<string>>(() => new Set(initialSelectedIds ?? []));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelectedIds ?? []));

  function toggleTopic(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const hasSelection = selected.size > 0;
  // In onboarding mode initialSelected is empty, so this equals hasSelection; in Settings'
  // edit mode it only counts real edits, not the pre-checked selection reopening with.
  const hasChanges =
    selected.size !== initialSelected.size || [...selected].some((id) => !initialSelected.has(id));

  return (
    <div className={styles.screen}>
      <ScreenHeader title={title ?? `What’s making you ${mood}?`} showProfileIcon={false} />

      <div className={styles.grid} role="group" aria-label="Select topics">
        {TOPICS.map((topic) => {
          const isSelected = selected.has(topic.id);
          return (
            <div className={styles.box} key={topic.id}>
              <button
                type="button"
                className={styles.photoButton}
                aria-pressed={isSelected}
                onClick={() => toggleTopic(topic.id)}
              >
                <img
                  className={`${styles.photo} ${isSelected ? styles.photoSelected : ''}`}
                  src={topic.photo}
                  alt=""
                  aria-hidden="true"
                />
                {isSelected && (
                  <img className={styles.checkMark} src={checkMark} alt="" aria-hidden="true" />
                )}
              </button>
              <p className={styles.label}>{topic.label}</p>
            </div>
          );
        })}
      </div>

      <OnboardingBottomNav
        onBack={onBack}
        onNext={() => onNext(Array.from(selected))}
        nextEnabled={hasChanges}
        nextLabel={nextLabel ?? (hasSelection ? `Next (${selected.size})` : 'Next')}
      />
    </div>
  );
}
