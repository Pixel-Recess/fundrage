import { useRef, useState, type ReactNode } from 'react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PhotoCameraIcon } from '../../components/icons/PhotoCameraIcon';
import { PersonIcon } from '../../components/icons/PersonIcon';
import { AlternateEmailIcon } from '../../components/icons/AlternateEmailIcon';
import { EmailIcon } from '../../components/icons/EmailIcon';
import { PhoneIcon } from '../../components/icons/PhoneIcon';
import { LocationOnIcon } from '../../components/icons/LocationOnIcon';
import type { UserProfile } from '../Account/profile';
import styles from './Profile.module.css';

export interface ProfileProps {
  profile: UserProfile;
  onBack: () => void;
  onSave: (profile: UserProfile) => void;
}

interface FieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

function Field({ icon, label, value, placeholder, onChange }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.fieldBox} ${value ? styles.fieldBoxFilled : ''}`}>
        <span className={styles.fieldIcon}>{icon}</span>
        <input
          className={styles.fieldInput}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
    </label>
  );
}

/**
 * Matches Figma's "Profile"/"Profile-Save" frames (node-id=3161-8476, 3161-8865) — white
 * header, mist-100 background, avatar + "Upload Image" button row, and a white card holding
 * the editable fields, following the same sizes/patterns as Account/Donate/Simulate. Password
 * / Re-enter Password fields from Figma are still dropped entirely — this app only supports
 * Sign in with Apple (see CreateAccount), so there's no password to manage. The photo action
 * sheet ("Profile - Photo") is mocked with a real file input, since there's no camera/photo-
 * library access in a browser prototype — both "Photo Library" and "Take a Photo" open the
 * same file picker here.
 */
export function Profile({ profile, onBack, onSave }: ProfileProps) {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(profile);

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setDraft((prev) => ({ ...prev, photoUrl: URL.createObjectURL(file) }));
    }
    setPickerOpen(false);
  }

  function handleSave() {
    onSave(draft);
    setSaved(true);
  }

  return (
    <div className={styles.screen}>
      <ScreenHeader title="Profile" showProfileIcon={false} variant="white" />

      <div className={styles.content}>
        <div className={styles.profileRow}>
          <span className={styles.avatar}>
            {draft.photoUrl ? (
              <img className={styles.avatarImg} src={draft.photoUrl} alt="" />
            ) : (
              <span className={styles.avatarPlaceholder} aria-hidden="true" />
            )}
          </span>
          <button type="button" className={styles.uploadButton} onClick={() => setPickerOpen(true)}>
            <PhotoCameraIcon size={14} />
            Upload Image
          </button>
        </div>

        <div className={styles.card}>
          <Field
            icon={<PersonIcon />}
            label="Your full name"
            value={draft.name}
            onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
          />
          <Field
            icon={<AlternateEmailIcon />}
            label="Username"
            value={draft.username}
            onChange={(v) => setDraft((p) => ({ ...p, username: v }))}
          />
          <Field
            icon={<EmailIcon />}
            label="Email"
            value={draft.email}
            onChange={(v) => setDraft((p) => ({ ...p, email: v }))}
          />
          <Field
            icon={<PhoneIcon />}
            label="Phone number"
            value={draft.phone}
            placeholder="(XXX) XXX-XXXX"
            onChange={(v) => setDraft((p) => ({ ...p, phone: v }))}
          />
          <Field
            icon={<LocationOnIcon />}
            label="Your location"
            value={draft.location}
            placeholder="Enter state"
            onChange={(v) => setDraft((p) => ({ ...p, location: v }))}
          />
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

      {pickerOpen && (
        <div className={styles.sheetBackdrop} onClick={() => setPickerOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetMenu}>
              <p className={styles.sheetTitle}>Upload Or Take A Photo</p>
              <p className={styles.sheetSubtitle}>Customize your profile</p>
              <button
                type="button"
                className={styles.sheetOption}
                onClick={() => fileInputRef.current?.click()}
              >
                Photo Library
              </button>
              <button
                type="button"
                className={`${styles.sheetOption} ${styles.sheetOptionBold}`}
                onClick={() => fileInputRef.current?.click()}
              >
                Take A Photo
              </button>
            </div>
            <button type="button" className={styles.sheetCancel} onClick={() => setPickerOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenFileInput}
        onChange={handleFileChosen}
      />

      {saved && (
        <div className={styles.toastBackdrop} role="alert">
          <div className={styles.toast}>
            <p className={styles.toastTitle}>Success!</p>
            <p className={styles.toastBody}>Your profile was updated.</p>
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
