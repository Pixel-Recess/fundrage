import { useRef, useState, type PointerEvent } from 'react';
import { NavFooter } from '../../components/NavFooter';
import { ONBOARDING_BG, ONBOARDING_STEPS } from './onboardingSteps';
import styles from './Onboarding.module.css';

const SWIPE_THRESHOLD_PX = 60;
const EDGE_RESISTANCE = 0.3;

export interface OnboardingProps {
  stepIndex: number;
  onSkip: () => void;
  onNext: () => void;
  /** Called when the user swipes right on any step after the first. */
  onPrevious: () => void;
  onLogin: () => void;
}

export function Onboarding({ stepIndex, onSkip, onNext, onPrevious, onLogin }: OnboardingProps) {
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
      <div className={styles.topBar} />

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
          {ONBOARDING_STEPS.map((step) => (
            <div className={styles.slide} style={{ width: `${100 / count}%` }} key={step.word}>
              <h1 className={styles.word}>{step.word}</h1>
              <div className={styles.illustrationWrap}>
                <img className={styles.bg} src={ONBOARDING_BG} alt="" aria-hidden="true" draggable={false} />
                <img
                  className={styles.illustration}
                  src={step.illustration}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
              </div>
              <p className={styles.body}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.progress} role="group" aria-label={`Step ${stepIndex + 1} of ${count}`}>
        {ONBOARDING_STEPS.map((s, i) => (
          <span key={s.word} className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ''}`} />
        ))}
      </div>

      <button type="button" className={styles.loginLink} onClick={onLogin}>
        Already have an account? <strong>Log in here</strong>
      </button>

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <NavFooter
          onBack={onSkip}
          onNext={onNext}
          nextEnabled
          backLabel="Skip"
          nextLabel={isLast ? 'Get Started' : 'Next'}
        />
      </div>
    </div>
  );
}
