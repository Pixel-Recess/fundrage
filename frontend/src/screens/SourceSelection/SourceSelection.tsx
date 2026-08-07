import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { OnboardingBottomNav } from '../../components/OnboardingBottomNav';
import radioEmpty from '../../assets/icons/radio-empty.svg';
import radioSelected from '../../assets/icons/radio-selected.svg';
import { SOURCES } from './sources';
import styles from './SourceSelection.module.css';

export interface SourceSelectionProps {
  onBack: () => void;
  onNext: (selectedSourceIds: string[]) => void;
  /** Pre-checks these sources — used when reopened from Settings to edit an existing selection. */
  initialSelectedIds?: string[];
  /** Overrides the header title (Settings uses "Your News Sources"). */
  title?: string;
  /** Overrides the footer's Next-button label (Settings uses a static "Save"). */
  nextLabel?: string;
}

export function SourceSelection({
  onBack,
  onNext,
  initialSelectedIds,
  title,
  nextLabel,
}: SourceSelectionProps) {
  const [initialSelected] = useState<Set<string>>(() => new Set(initialSelectedIds ?? []));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelectedIds ?? []));

  function toggleSource(id: string) {
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
      <ScreenHeader title={title ?? 'Where do you get your news?'} showProfileIcon={false} />

      <div className={styles.list} role="group" aria-label="Select news sources">
        {SOURCES.map((source) => {
          const isSelected = selected.has(source.id);
          return (
            <button
              type="button"
              key={source.id}
              className={styles.row}
              aria-pressed={isSelected}
              onClick={() => toggleSource(source.id)}
            >
              <img
                className={styles.radio}
                src={isSelected ? radioSelected : radioEmpty}
                alt=""
                aria-hidden="true"
              />
              <span className={`${styles.rowLabel} ${isSelected ? styles.rowLabelSelected : ''}`}>
                {source.label}
              </span>
            </button>
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
