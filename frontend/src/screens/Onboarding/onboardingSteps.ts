import bg from '../../assets/illustrations/onboarding-bg.png';
import feel from '../../assets/illustrations/onboarding-feel.png';
import find from '../../assets/illustrations/onboarding-find.png';
import fundrage from '../../assets/illustrations/onboarding-fundrage.png';

export interface OnboardingStep {
  word: string;
  illustration: string;
  body: string;
}

/** Shared circular background behind every step's illustration. */
export const ONBOARDING_BG = bg;

/**
 * Mirrors Onboarding1/2/3 in the Figma prototype (node-ids 21:604, 21:661, 21:706).
 * Copy is verbatim from those frames.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    word: 'Feel',
    illustration: feel,
    body: 'Are you reading the news or seeing something that makes you feel hopeless, frustrated, angry - even excited - and unsure what to do?',
  },
  {
    word: 'Find',
    illustration: find,
    body: 'Fundrage connects you with nonprofits that directly support the causes that make you want to take action.',
  },
  {
    word: 'Fundrage',
    illustration: fundrage,
    body: 'Donate to the nonprofit that channels your anger into action!',
  },
];
