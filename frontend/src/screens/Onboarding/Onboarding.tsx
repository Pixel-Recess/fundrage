import { useRef, useState, type PointerEvent } from 'react';
import tail from '../../assets/brand/Talkbubble-Tail-White.svg';
import { ONBOARDING_STEPS } from './onboardingSteps';
import styles from './Onboarding.module.css';

const SWIPE_THRESHOLD_PX = 60;
const EDGE_RESISTANCE = 0.3;

export interface OnboardingProps {
  stepIndex: number;
  onNext: () => void;
  /** Called when the user swipes right on any step after the first. */
  onPrevious: () => void;
  /** "Log In" is available on every step, for a returning user whose session timed out. */
  onLogin: () => void;
}

export function Onboarding({ stepIndex, onNext, onPrevious, onLogin }: OnboardingProps) {
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
  const count = ONBOARDING_STEPS.length;

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    setIsDragging(true);
    startXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    let delta = e.clientX - startXRef.current;
    if (stepIndex === 0 && delta > 0) delta *= EDGE_RESISTANCE;
    if (isLast && delta < 0) delta *= EDGE_RESISTANCE;
    setDragOffset(delta);
  }

  function endDrag() {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset <= -SWIPE_THRESHOLD_PX && !isLast) {
      onNext();
    } else if (dragOffset >= SWIPE_THRESHOLD_PX && stepIndex > 0) {
      onPrevious();
    }
    setDragOffset(0);
  }

  const trackPercent = -(stepIndex * (100 / count));

  return (
    <div className={styles.screen}>
      <div className={styles.trackWrap}>
        <div
          className={styles.track}
          style={{
            width: `${count * 100}%`,
            transform: `translateX(calc(${trackPercent}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 300ms ease',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {ONBOARDING_STEPS.map((step, i) => (
            <div className={styles.slide} style={{ width: `${100 / count}%` }} key={i}>
              <img
                className={styles.photo}
                src={step.photo}
                style={{ objectPosition: step.photoPosition }}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
              <div className={styles.talkBubble} style={{ top: step.bubbleTop }}>
                <div className={styles.textBox}>
                  <p className={styles.body}>{step.body}</p>
                </div>
                <div className={styles.tailWrap}>
                  <img className={styles.tail} src={tail} alt="" aria-hidden="true" draggable={false} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomOverlay}>
        <div className={styles.progress} role="group" aria-label={`Step ${stepIndex + 1} of ${count}`}>
          {ONBOARDING_STEPS.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ''}`} />
          ))}
        </div>

        <div className={styles.bottomNav}>
          <button type="button" className={styles.loginButton} onClick={onLogin}>
            Log In
          </button>
          <button type="button" className={styles.getStartedButton} onClick={onNext}>
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
