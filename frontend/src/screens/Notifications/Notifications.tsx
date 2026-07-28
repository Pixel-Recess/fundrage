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

/**
 * Built from Figma's "Notifications" frame (57:1103). Toggles auto-save to local
 * state immediately (no separate Save step) — matching how iOS Settings toggles
 * behave, and simpler than a form since there's no real backend to persist to yet.
 * The footer's "START DONATING" CTA from Figma only makes sense in an onboarding
 * context; here (reached from Settings) it's a plain Back link instead.
 */
export function Notifications({ onBack }: NotificationsProps) {
  const [donationReminder, setDonationReminder] = useState(true);
  const [push, setPush] = useState(true);
  const [text, setText] = useState(false);
  const [email, setEmail] = useState(true);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Notifications" showProfileIcon={false} />

      <div className={styles.content}>
        <p className={styles.sectionLabel}>Notify me when</p>
        <div className={styles.group}>
          <ToggleRow
            label="I haven't donated in a while"
            checked={donationReminder}
            onChange={setDonationReminder}
          />
        </div>

        <p className={styles.sectionLabel}>Notify me via</p>
        <div className={styles.group}>
          <ToggleRow label="Push notifications" checked={push} onChange={setPush} />
          <ToggleRow label="Text" checked={text} onChange={setText} />
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
