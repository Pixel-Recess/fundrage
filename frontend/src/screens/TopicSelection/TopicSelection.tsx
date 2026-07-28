import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { NavFooter } from '../../components/NavFooter';
import checkBadge from '../../assets/icons/check-badge.svg';
import { TOPICS } from './topics';
import styles from './TopicSelection.module.css';

const ROW_SIZE = 3;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

const rows = chunk(TOPICS, ROW_SIZE);

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
        {rows.map((row) => (
          <div className={styles.row} key={row.map((topic) => topic.id).join('-')}>
            {row.map((topic) => {
              const isSelected = selected.has(topic.id);
              return (
                <div className={styles.box} key={topic.id}>
                  <button
                    type="button"
                    className={`${styles.photoButton} ${isSelected ? styles.photoButtonSelected : ''}`}
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
                      <img className={styles.checkBadge} src={checkBadge} alt="" aria-hidden="true" />
                    )}
                  </button>
                  <p className={styles.label}>{topic.label}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <NavFooter
        onBack={onBack}
        onNext={() => onNext(Array.from(selected))}
        nextEnabled={hasChanges}
        nextLabel={nextLabel ?? (hasSelection ? `Next (${selected.size})` : 'Next')}
      />
    </div>
  );
}
