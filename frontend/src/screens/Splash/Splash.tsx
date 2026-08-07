import { useEffect, useState } from 'react';
import logo from '../../assets/brand/Logotype-Bubble-White.svg';
import styles from './Splash.module.css';

export interface SplashProps {
  onComplete: () => void;
}

/**
 * Figma "Loading1/2/3" frames (node-id=3048-2200, 3142-5266, 3142-5272) — a staged
 * reveal (logo, then "Don't get mad.", then "Get giving.") rather than a single static
 * screen. The three frames aren't exposed as a real prototype transition via the MCP
 * (get_motion_context returned no keyframe data for this flow), so the timing below is
 * a reasonable staggered-fade reconstruction, not pulled from recorded animation curves.
 */
export function Splash({ onComplete }: SplashProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), 2600);
    const doneTimer = setTimeout(onComplete, 3000);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <button
      type="button"
      className={`${styles.screen} ${leaving ? styles.leaving : ''}`}
      onClick={onComplete}
      aria-label="Skip loading screen"
    >
      <img className={styles.logo} src={logo} alt="FundRage" />
      <div className={styles.tagline}>
        <p className={`${styles.line} ${styles.lineOne}`}>Don&rsquo;t get mad.</p>
        <p className={`${styles.line} ${styles.lineTwo}`}>Get giving.</p>
      </div>
    </button>
  );
}
