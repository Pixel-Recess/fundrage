import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import styles from './Notifications.module.css';

export interface NotificationsProps {
  onBack: () => void;
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}

type Frequency = 'daily' | 'weekly' | 'onNews';

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Once a day' },
  { value: 'weekly', label: 'Once a week' },
  { value: 'onNews', label: 'When a cause is in the news' },
];

interface Prefs {
  frequency: Frequency;
  push: boolean;
  email: boolean;
}

const INITIAL_PREFS: Prefs = { frequency: 'onNews', push: true, email: true };

/**
 * Matches Figma's "Notifications"/"Notifications-Save" frames (node-id=3161-8959,
 * 3320-9651) — white header, mist-100 background, two white cards, and a Back/Save Updates
 * bottom nav following the same pattern as Profile/Contact. Changed from a prior auto-save
 * design (toggles committing immediately, no Save step) to match this explicit disabled →
 * enabled Save Updates affordance Figma now shows. "Text" delivery was dropped per earlier
 * explicit product call — not confident it'll ship even in an early version, unlike
 * Push/Email.
 */
export function Notifications({ onBack }: NotificationsProps) {
  const [draft, setDraft] = useState<Prefs>(INITIAL_PREFS);
  const [saved, setSaved] = useState(false);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(INITIAL_PREFS);

  function handleSave() {
    setSaved(true);
  }

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Notifications" showProfileIcon={false} variant="white" />

      <div className={styles.content}>
        <div className={styles.card}>
          <p className={styles.cardHeading}>Notify me...</p>
          <div className={styles.group}>
            {FREQUENCY_OPTIONS.map((option) => (
              <ToggleRow
                key={option.value}
                label={option.label}
                checked={draft.frequency === option.value}
                onChange={(checked) => {
                  if (checked) setDraft((p) => ({ ...p, frequency: option.value }));
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardHeading}>Notify me via...</p>
          <div className={styles.group}>
            <ToggleRow
              label="Push notifications"
              checked={draft.push}
              onChange={(push) => setDraft((p) => ({ ...p, push }))}
            />
            <ToggleRow
              label="Email"
              checked={draft.email}
              onChange={(email) => setDraft((p) => ({ ...p, email }))}
            />
          </div>
        </div>
      </div>

      <footer className={styles.bottomNav}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className={styles.saveButton}
          disabled={!hasChanges}
          onClick={handleSave}
        >
          Save Updates
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />

      {saved && (
        <div className={styles.toastBackdrop} role="alert">
          <div className={styles.toast}>
            <p className={styles.toastTitle}>Success!</p>
            <p className={styles.toastBody}>Your notification preferences were updated.</p>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => {
                setSaved(false);
                onBack();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
