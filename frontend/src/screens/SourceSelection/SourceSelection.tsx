import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { OnboardingBottomNav } from '../../components/OnboardingBottomNav';
import radioEmpty from '../../assets/icons/radio-empty.svg';
import radioSelected from '../../assets/icons/radio-selected.svg';
import radioEmptyDark from '../../assets/icons/radio-empty-dark.svg';
import radioSelectedDark from '../../assets/icons/radio-selected-dark.svg';
import { SOURCES } from './sources';
import styles from './SourceSelection.module.css';

export interface SourceSelectionProps {
  onBack: () => void;
  onNext: (selectedSourceIds: string[]) => void;
  /** Pre-checks these sources — used when reopened from Settings to edit an existing selection. */
  initialSelectedIds?: string[];
  /** Overrides the header title (Settings uses "Your News Sources"). */
  title?: string;
  /** Overrides the footer's Next-button label (Settings uses a static "Save Updates"). */
  nextLabel?: string;
  /** "settings" matches Figma's News_Prefs frames (node-id=3320-10243) — white header,
   *  mist-100 background, sources in a single white card. Defaults to the red onboarding look. */
  variant?: 'onboarding' | 'settings';
}

export function SourceSelection({
  onBack,
  onNext,
  initialSelectedIds,
  title,
  nextLabel,
  variant = 'onboarding',
}: SourceSelectionProps) {
  const [initialSelected] = useState<Set<string>>(() => new Set(initialSelectedIds ?? []));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelectedIds ?? []));
  const isSettings = variant === 'settings';

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

  const list = (
    <div className={`${styles.list} ${isSettings ? styles.listSettings : ''}`} role="group" aria-label="Select news sources">
      {SOURCES.map((source) => {
        const isSelected = selected.has(source.id);
        return (
          <button
            type="button"
            key={source.id}
            className={`${styles.row} ${isSettings ? styles.rowSettings : ''}`}
            aria-pressed={isSelected}
            onClick={() => toggleSource(source.id)}
          >
            <img
              className={styles.radio}
              src={
                isSettings
                  ? isSelected
                    ? radioSelectedDark
                    : radioEmptyDark
                  : isSelected
                    ? radioSelected
                    : radioEmpty
              }
              alt=""
              aria-hidden="true"
            />
            <span
              className={`${styles.rowLabel} ${isSettings ? styles.rowLabelSettings : ''} ${
                isSelected ? (isSettings ? styles.rowLabelSettingsSelected : styles.rowLabelSelected) : ''
              }`}
            >
              {source.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`${styles.screen} ${isSettings ? styles.screenSettings : ''}`}>
      <ScreenHeader
        title={title ?? 'Where do you get your news?'}
        showProfileIcon={false}
        variant={isSettings ? 'white' : 'red'}
      />

      {isSettings ? (
        <div className={styles.content}>
          <div className={styles.card}>{list}</div>
        </div>
      ) : (
        list
      )}

      {isSettings ? (
        <footer className={styles.bottomNav}>
          <button type="button" className={styles.backButton} onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className={styles.saveButton}
            disabled={!hasChanges}
            onClick={() => onNext(Array.from(selected))}
          >
            {nextLabel ?? 'Save Updates'}
          </button>
        </footer>
      ) : (
        <OnboardingBottomNav
          onBack={onBack}
          onNext={() => onNext(Array.from(selected))}
          nextEnabled={hasChanges}
          nextLabel={nextLabel ?? (hasSelection ? `Next (${selected.size})` : 'Next')}
        />
      )}
      {isSettings && <div className={styles.navSpacer} aria-hidden="true" />}
    </div>
  );
}
