import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './StepTransition.module.css';

export interface StepTransitionProps {
  /** Usually the top-level step's `name` — changing this triggers a push/pop slide. */
  transitionKey: string;
  children: ReactNode;
  /** Keys that should cut instantly rather than slide — for screens with their own entrance/exit
   *  animation (a fading splash screen, a slide-up modal sheet) that a horizontal push/pop on top
   *  of would just look busy. Applies when either the outgoing or incoming key is in this set. */
  skipTransitionFor?: string[];
}

interface OutgoingSlot {
  key: string;
  node: ReactNode;
  direction: 'forward' | 'back';
}

// Keep in sync with the animation-duration values in StepTransition.module.css.
const ANIMATION_MS = 320;

/**
 * iOS UINavigationController-style push/pop slide between top-level app screens: forward
 * navigation slides the new screen in from the right over a parallax-dimmed outgoing screen;
 * back navigation slides the top screen fully off to the right, revealing the previous one
 * sliding back in from its dimmed, parallax-shifted position — matching the native push/pop
 * transition, not something an iOS build gets "for free" only because this is a web demo:
 * a real native (or React Native) build gets this same slide automatically from its own
 * navigation stack, so this component exists purely to preview that feel here.
 *
 * Direction is inferred from a simple history stack of transitionKeys — landing on a key
 * that's one below the current top of the stack reads as "back"; anything else reads as
 * "forward". This is a heuristic, not a real router, so it can misread non-linear jumps
 * (e.g. Sign Out from deep in Settings) as "forward" — an acceptable simplification here.
 */
export function StepTransition({ transitionKey, children, skipTransitionFor = [] }: StepTransitionProps) {
  const prevKeyRef = useRef(transitionKey);
  const prevChildrenRef = useRef(children);
  const historyRef = useRef<string[]>([transitionKey]);
  const [outgoing, setOutgoing] = useState<OutgoingSlot | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  if (prevKeyRef.current !== transitionKey) {
    const fromKey = prevKeyRef.current;
    const fromChildren = prevChildrenRef.current;
    const history = historyRef.current;
    const isBack = history.length >= 2 && history[history.length - 2] === transitionKey;
    const nextDirection: 'forward' | 'back' = isBack ? 'back' : 'forward';
    if (isBack) {
      history.pop();
    } else {
      history.push(transitionKey);
    }

    if (!skipTransitionFor.includes(fromKey) && !skipTransitionFor.includes(transitionKey)) {
      setOutgoing({ key: fromKey, node: fromChildren, direction: nextDirection });
      setDirection(nextDirection);
    }
    prevKeyRef.current = transitionKey;
  }
  prevChildrenRef.current = children;

  useEffect(() => {
    if (!outgoing) return;
    const id = window.setTimeout(() => setOutgoing(null), ANIMATION_MS);
    return () => window.clearTimeout(id);
  }, [outgoing]);

  return (
    <div className={styles.stage}>
      {outgoing && (
        <div
          key={outgoing.key}
          className={`${styles.layer} ${
            outgoing.direction === 'forward' ? styles.exitForward : styles.exitBack
          }`}
        >
          {outgoing.node}
        </div>
      )}
      <div
        key={transitionKey}
        className={`${styles.layer} ${
          outgoing ? (direction === 'forward' ? styles.enterForward : styles.enterBack) : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
