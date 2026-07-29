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
  { value: 'onNews', label: 'When a cause I care is in the news' },
];

/**
 * Built from Figma's "Notifications" frame (57:1103). Toggles auto-save to local
 * state immediately (no separate Save step) — matching how iOS Settings toggles
 * behave, and simpler than a form since there's no real backend to persist to yet.
 * The footer's "START DONATING" CTA from Figma only makes sense in an onboarding
 * context; here (reached from Settings) it's a plain Back link instead.
 *
 * "Notify me" is a single-select frequency choice (only one active at a time, per
 * Figma's mock state) rendered with the same toggle-switch visual as the delivery
 * rows below — clicking an option selects it; clicking the already-selected one is
 * a no-op, same as a radio group. "Text" delivery was dropped per explicit product
 * call — not confident it'll ship even in an early version, unlike Push/Email.
 */
export function Notifications({ onBack }: NotificationsProps) {
  const [frequency, setFrequency] = useState<Frequency>('onNews');
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Notifications" showProfileIcon={false} />

      <div className={styles.content}>
        <p className={styles.sectionLabel}>Notify me</p>
        <div className={styles.group}>
          {FREQUENCY_OPTIONS.map((option) => (
            <ToggleRow
              key={option.value}
              label={option.label}
              checked={frequency === option.value}
              onChange={(checked) => {
                if (checked) setFrequency(option.value);
              }}
            />
          ))}
        </div>

        <p className={styles.sectionLabel}>Notify me via</p>
        <div className={styles.group}>
          <ToggleRow label="Push notifications" checked={push} onChange={setPush} />
          <ToggleRow label="Email (in profile)" checked={email} onChange={setEmail} />
        </div>
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
      </footer>
      <div className={styles.footerSpacer} aria-hidden="true" />
    </div>
  );
}
