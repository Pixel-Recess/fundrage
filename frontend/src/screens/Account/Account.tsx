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
import { ExitToAppIcon } from '../../components/icons/ExitToAppIcon';
import { ReceiptIcon } from '../../components/icons/ReceiptIcon';
import type { UserProfile } from './profile';
import styles from './Account.module.css';

export interface AccountProps {
  profile: UserProfile;
  topicCount: number;
  sourceCount: number;
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
  detail?: string;
  external?: boolean;
  onClick?: () => void;
}

function OptionRow({ icon, label, detail, external, onClick }: OptionRowProps) {
  return (
    <button type="button" className={styles.row} onClick={onClick} disabled={!onClick}>
      <span className={styles.rowLeft}>
        <span className={styles.rowLeadingIcon}>{icon}</span>
        <span className={styles.rowLabel}>{label}</span>
      </span>
      <span className={styles.rowRight}>
        {detail && <span className={styles.rowDetail}>{detail}</span>}
        <span className={styles.rowIcon}>{external ? <OpenInNewIcon /> : <ChevronRightIcon />}</span>
      </span>
    </button>
  );
}

/**
 * Built from Figma's "Account" frame (41:1166), combined with the delete-confirm
 * interaction from "Account - Delete" (64:1319). Payment Method (and the donation-stats
 * chart, which only makes sense once real payment settings exist) are still left out —
 * Donation Receipts was added back per explicit request, since a receipt history doesn't
 * require touching payment/card data itself (see Receipts/ReceiptDetail).
 */
export function Account({
  profile,
  topicCount,
  sourceCount,
  onBack,
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
      <ScreenHeader title="Your Account" showProfileIcon={false} />

      <div className={styles.profileBand}>
        <button type="button" className={styles.profileSummary} onClick={onOpenProfile}>
          <span className={styles.avatar}>
            {profile.photoUrl ? (
              <img className={styles.avatarImg} src={profile.photoUrl} alt="" />
            ) : (
              <span className={styles.avatarPlaceholder} aria-hidden="true" />
            )}
          </span>
          <span className={styles.profileName}>{profile.name}</span>
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.sectionLabel}>Account Details</p>
        <div className={styles.group}>
          <OptionRow icon={<AccountCircleIcon />} label="Your Profile" onClick={onOpenProfile} />
          <OptionRow
            icon={<LabelIcon />}
            label="Your Topics"
            detail={`${topicCount} selected`}
            onClick={onEditTopics}
          />
          <OptionRow
            icon={<ChromeReaderModeIcon />}
            label="News Sources"
            detail={`${sourceCount} selected`}
            onClick={onEditSources}
          />
          <OptionRow icon={<ReceiptIcon />} label="Donation Receipts" onClick={onOpenReceipts} />
        </div>

        <p className={styles.sectionLabel}>Settings</p>
        <div className={styles.group}>
          <OptionRow icon={<NotificationsIcon />} label="Notifications" onClick={onOpenNotifications} />
        </div>

        <p className={styles.sectionLabel}>Support</p>
        <div className={styles.group}>
          <OptionRow icon={<ChatIcon />} label="Contact Us" onClick={onOpenContact} />
          <OptionRow icon={<HelpIcon />} label="FAQs" external />
        </div>

        <p className={styles.sectionLabel}>About Fundrage</p>
        <div className={styles.group}>
          <OptionRow icon={<DescriptionIcon />} label="User Agreement" external />
          <OptionRow icon={<VerifiedUserIcon />} label="Privacy Policy" external />
        </div>

        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => setConfirmingDelete(true)}
        >
          Delete Your Account
        </button>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.footerButton} ${styles.footerBackButton}`}
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className={`${styles.footerButton} ${styles.footerActionButton}`}
          onClick={onSignOut}
        >
          SIGN OUT
          <ExitToAppIcon size={14} />
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
