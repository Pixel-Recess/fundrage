import feel from '../../assets/illustrations/intro-feel.jpg';
import find from '../../assets/illustrations/intro-find.jpg';
import fundrage from '../../assets/illustrations/intro-fundrage.jpg';

export interface OnboardingStep {
  photo: string;
  /** CSS object-position for the background photo, approximating the framing Figma chose. */
  photoPosition: string;
  /** Talk bubble's vertical position, as a percentage of screen height (from Figma's px/844). */
  bubbleTop: string;
  body: string;
}

/**
 * Mirrors Intro1/2/3 in the Figma prototype (node-id=3048-2225, 3048-2440, 3048-2666).
 * Copy is verbatim from those frames. Full-bleed photos replace the old circular
 * illustrations; photoPosition is a best-effort approximation of Figma's crop, since the
 * MCP exports the original untransformed source photo rather than the pre-cropped frame.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    photo: feel,
    photoPosition: '70% 20%',
    bubbleTop: '33.2%',
    body: 'The news got you angry, frustrated or hopeless? Wish there was something you could do? Us, too.',
  },
  {
    photo: find,
    photoPosition: '50% 15%',
    bubbleTop: '54.5%',
    body: 'Fundrage connects you with nonprofits that directly support the causes that make you want to take action.',
  },
  {
    photo: fundrage,
    photoPosition: '65% 15%',
    bubbleTop: '37.9%',
    body: 'So when news breaks, donate to a non-profit to channel anger into action.',
  },
];
