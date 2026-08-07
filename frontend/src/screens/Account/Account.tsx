import { useState, type ReactNode } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { OpenInNewIcon } from '../../components/icons/OpenInNewIcon';
import { AccountCircleIcon } from '../../components/icons/AccountCircleIcon';
import { LabelIcon } from '../../components/icons/LabelIcon';
import { ChromeReaderModeIcon } from '../../components/icons/ChromeReaderModeIcon';
import { NotificationsIcon } from '../../components/icons/NotificationsIcon';
import { ChatIcon } from '../../components/icons/ChatIcon';
import { HelpIcon } from '../../components/icons/HelpIcon';
import { DescriptionIcon } from '../../components/icons/DescriptionIcon';
import { VerifiedUserIcon } from '../../components/icons/VerifiedUserIcon';
import { ReceiptIcon } from '../../components/icons/ReceiptIcon';
import type { UserProfile } from './profile';
import styles from './Account.module.css';

export interface AccountProps {
  profile: UserProfile;
  totalDonations: number;
  onBack: () => void;
  onOpenProfile: () => void;
  onEditTopics: () => void;
  onEditSources: () => void;
  onOpenNotifications: () => void;
  onOpenContact: () => void;
  onOpenReceipts: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

interface OptionRowProps {
  icon: ReactNode;
  label: string;
  external?: boolean;
  onClick?: () => void;
}

function OptionRow({ icon, label, external, onClick }: OptionRowProps) {
  return (
    <button type="button" className={styles.row} onClick={onClick} disabled={!onClick}>
      <span className={styles.rowLeft}>
        <span className={styles.rowLeadingIcon}>{icon}</span>
        <span className={styles.rowLabel}>{label}</span>
      </span>
      <span className={styles.rowIcon}>{external ? <OpenInNewIcon /> : <ChevronRightIcon />}</span>
    </button>
  );
}

interface CardProps {
  heading: string;
  children: ReactNode;
}

function Card({ heading, children }: CardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.cardHeading}>{heading}</p>
      <div className={styles.group}>{children}</div>
    </div>
  );
}

/**
 * Matches Figma's "Account-New"/"Account" frames (node-id=3161-7722, 3161-7567) — the same
 * empty-state-vs-complete-profile pair, with each section now its own white card on a
 * mist-100 background, and a white header (rage-200 title) instead of the app's usual red
 * one. Payment Method (and a donation-stats chart, which only makes sense once real payment
 * settings exist) are still left out — Donation Receipts was added back per explicit request,
 * since a receipt history doesn't require touching payment/card data itself (see
 * Receipts/ReceiptDetail). The per-row topic/source counts Figma's own OptionRow doesn't show
 * were dropped to match exactly; that detail is still one tap away on those screens.
 */
export function Account({
  profile,
  onBack,
  totalDonations,
  onOpenProfile,
  onEditTopics,
  onEditSources,
  onOpenNotifications,
  onOpenContact,
  onOpenReceipts,
  onSignOut,
  onDeleteAccount,
}: AccountProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Your Account" showProfileIcon={false} variant="white" />

      <div className={styles.profileBand}>
        <button type="button" className={styles.profileSummary} onClick={onOpenProfile}>
          <span className={styles.avatar}>
            {profile.photoUrl ? (
              <img className={styles.avatarImg} src={profile.photoUrl} alt="" />
            ) : (
              <span className={styles.avatarPlaceholder} aria-hidden="true" />
            )}
          </span>
          <span className={styles.profileText}>
            <span className={styles.profileName}>{profile.name}</span>
            {totalDonations > 0 && (
              <span className={styles.donationsTotal}>
                Total Donations: <strong>${totalDonations}</strong>
              </span>
            )}
          </span>
        </button>
      </div>

      <div className={styles.content}>
        <Card heading="Account Details">
          <OptionRow icon={<AccountCircleIcon />} label="Your Profile" onClick={onOpenProfile} />
          <OptionRow icon={<LabelIcon />} label="Your Topics" onClick={onEditTopics} />
          <OptionRow icon={<ChromeReaderModeIcon />} label="Your News Sources" onClick={onEditSources} />
          <OptionRow icon={<ReceiptIcon />} label="Donation Receipts" onClick={onOpenReceipts} />
        </Card>

        <Card heading="Settings">
          <OptionRow icon={<NotificationsIcon />} label="Notifications" onClick={onOpenNotifications} />
        </Card>

        <Card heading="Support">
          <OptionRow icon={<ChatIcon />} label="Contact Us" onClick={onOpenContact} />
          <OptionRow icon={<HelpIcon />} label="FAQs" external />
        </Card>

        <Card heading="About Fundrage">
          <OptionRow icon={<DescriptionIcon />} label="User Agreement" external />
          <OptionRow icon={<VerifiedUserIcon />} label="Privacy Policy" external />
        </Card>

        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => setConfirmingDelete(true)}
        >
          Delete your account
        </button>
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <button type="button" className={styles.signOutButton} onClick={onSignOut}>
          Sign Out
        </button>
      </footer>
      <div className={styles.footerSpacer} aria-hidden="true" />

      {confirmingDelete && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <p className={styles.modalTitle}>Are you sure?</p>
            <p className={styles.modalBody}>
              By tapping “Delete” you will be permanently deleting your account and all information.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalDelete} onClick={onDeleteAccount}>
                Delete
              </button>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
