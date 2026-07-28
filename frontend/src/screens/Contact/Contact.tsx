import { useState } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { NavFooter } from '../../components/NavFooter';
import { RadioButtonIcon } from '../../components/icons/RadioButtonIcon';
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
 * Built from Figma's "Contact" frame (57:1155). "Send Feedback" is mocked — there's
 * no support inbox behind this prototype, so submitting just shows a confirmation
 * and returns to Account.
 */
export function Contact({ onBack }: ContactProps) {
  const [issue, setIssue] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Contact Us" showProfileIcon={false} />

      <div className={styles.content}>
        <p className={styles.sectionLabel}>What's going on?</p>
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
              <span className={styles.radioDot}>
                <RadioButtonIcon checked={issue === option} />
              </span>
              <span className={styles.rowLabel}>{option}</span>
            </button>
          ))}
        </div>

        <p className={styles.sectionLabel}>Describe your issue</p>
        <label className={styles.fieldWrap}>
          <span className={styles.fieldCaption}>Please provide detailed information on your issue.</span>
          <textarea
            className={styles.textarea}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="List the problems or suggestions you have for us, please be sure to include a website address if you are suggesting a nonprofit."
          />
        </label>
      </div>

      <NavFooter
        onBack={onBack}
        onNext={() => setSent(true)}
        nextEnabled={issue !== null}
        nextLabel="Send Feedback"
      />

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
