import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import radioEmpty from '../../assets/icons/radio-empty-dark.svg';
import radioSelected from '../../assets/icons/radio-selected-dark.svg';
import styles from './Contact.module.css';

export interface ContactProps {
  onBack: () => void;
}

const ISSUE_OPTIONS = [
  'There was a problem with my donation.',
  'I want to suggest a nonprofit.',
  'I had another issue.',
];

/**
 * Matches Figma's "Contact"/"Contact-Save" frames (node-id=3320-9831, 3320-9895) — white
 * header, mist-100 background, and two white cards, following the same pattern as
 * Profile/Notifications. "Send Message" is mocked — there's no support inbox behind this
 * prototype, so submitting just shows a confirmation and returns to Account.
 */
export function Contact({ onBack }: ContactProps) {
  const [issue, setIssue] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Contact Us" showProfileIcon={false} variant="white" />

      <div className={styles.content}>
        <div className={styles.card}>
          <p className={styles.cardHeading}>What&rsquo;s going on?</p>
          <div className={styles.group} role="radiogroup" aria-label="Issue type">
            {ISSUE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={issue === option}
                className={styles.row}
                onClick={() => setIssue(option)}
              >
                <img
                  className={styles.radioIcon}
                  src={issue === option ? radioSelected : radioEmpty}
                  alt=""
                  aria-hidden="true"
                />
                <span className={`${styles.rowLabel} ${issue === option ? styles.rowLabelSelected : ''}`}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardHeading}>Describe your issue</p>
          <label className={styles.fieldWrap}>
            <span className={styles.fieldLabel}>Please provide detailed information on your issue</span>
            <textarea
              className={styles.textarea}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="List the problems or suggestions you have for us, please be sure to include a website address if you are suggesting a nonprofit."
            />
          </label>
        </div>
      </div>

      <footer className={styles.bottomNav}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className={styles.sendButton}
          disabled={issue === null}
          onClick={() => setSent(true)}
        >
          Send Message
        </button>
      </footer>
      <div className={styles.navSpacer} aria-hidden="true" />

      {sent && (
        <div className={styles.toastBackdrop} role="alert">
          <div className={styles.toast}>
            <p className={styles.toastTitle}>Thanks!</p>
            <p className={styles.toastBody}>We've received your message and will follow up by email.</p>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => {
                setSent(false);
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
