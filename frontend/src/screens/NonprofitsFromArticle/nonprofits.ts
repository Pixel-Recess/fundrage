export interface Nonprofit {
  id: string;
  name: string;
  description: string;
  topicIds: string[];
}

/**
 * Entirely fictional nonprofits — deliberately not real organizations. Real
 * charity names were avoided here (even though the Figma prototype used real
 * ones) since there's no real Charity Navigator/Candid verification behind
 * this list yet (that's Phase 1, per docs/fundrage-backend-spec.md §4.4 —
 * matching requires cn_rating >= 75 AND candid_apple_pay_eligible = true).
 * Showing real org names next to fake "verified" framing risked misrepresenting
 * organizations that were never actually checked.
 */
export const NONPROFITS: Nonprofit[] = [
  { id: 'coastal-paws-rescue', name: 'Coastal Paws Rescue', description: 'Emergency shelter and rehoming for animals displaced by disasters and neglect.', topicIds: ['animal-rights'] },
  { id: 'wildlife-first-response', name: 'Wildlife First Response', description: 'Rapid-response rescue teams for wildlife caught in wildfires, floods, and spills.', topicIds: ['animal-rights'] },

  { id: 'rapid-relief-network', name: 'Rapid Relief Network', description: 'Mobile teams delivering food, water, and shelter within 48 hours of a disaster.', topicIds: ['disaster-relief'] },
  { id: 'groundwork-recovery-corps', name: 'Groundwork Recovery Corps', description: 'Long-term rebuilding support for communities after the news cameras leave.', topicIds: ['disaster-relief'] },

  { id: 'safe-harbor-alliance', name: 'Safe Harbor Alliance', description: '24/7 crisis hotline and emergency housing for survivors of domestic violence.', topicIds: ['domestic-violence'] },
  { id: 'quiet-room-fund', name: 'Quiet Room Fund', description: 'Funds confidential relocation and legal support for abuse survivors and their kids.', topicIds: ['domestic-violence'] },

  { id: 'brightpath-tutoring', name: 'Brightpath Tutoring Corps', description: 'Free after-school tutoring in under-resourced public school districts.', topicIds: ['education'] },
  { id: 'first-gen-forward', name: 'First Gen Forward', description: 'College application support and scholarships for first-generation students.', topicIds: ['education'] },

  { id: 'greenline-conservancy', name: 'Greenline Conservancy', description: 'Restores wetlands and urban green space to fight local climate impact.', topicIds: ['environment'] },
  { id: 'blue-current-project', name: 'Blue Current Project', description: 'Removes plastic waste from coastlines and pushes for cleaner-water policy.', topicIds: ['environment'] },

  { id: 'fair-ledger-initiative', name: 'Fair Ledger Initiative', description: 'Audits employer pay data and helps workers file wage-gap claims for free.', topicIds: ['equal-pay'] },
  { id: 'equalscale-fund', name: 'EqualScale Fund', description: 'Legal aid fund backing equal-pay lawsuits that individuals can’t afford alone.', topicIds: ['equal-pay'] },

  { id: 'common-ground-safety', name: 'Common Ground Safety Project', description: 'Community gun-safety education and safe-storage giveaway programs.', topicIds: ['gun-control'] },
  { id: 'survivors-voice-coalition', name: 'Survivors’ Voice Coalition', description: 'Advocacy group led by gun violence survivors pushing for policy reform.', topicIds: ['gun-control'] },

  { id: 'keys-home-fund', name: 'Keys Home Fund', description: 'Emergency rent assistance to keep families from losing their housing.', topicIds: ['housing'] },
  { id: 'buildup-housing-trust', name: 'BuildUp Housing Trust', description: 'Builds low-cost housing units in partnership with local communities.', topicIds: ['housing'] },

  { id: 'border-aid-network', name: 'Border Aid Network', description: 'Legal representation and humanitarian aid for migrants and asylum seekers.', topicIds: ['immigration'] },
  { id: 'new-neighbors-fund', name: 'New Neighbors Fund', description: 'Helps newly arrived immigrant families with housing, work permits, and ESL.', topicIds: ['immigration'] },

  { id: 'openhouse-youth-line', name: 'OpenHouse Youth Line', description: 'Crisis line and safe housing for LGBTQ+ youth facing family rejection.', topicIds: ['lgbtq'] },
  { id: 'pridelight-legal-aid', name: 'Pridelight Legal Aid', description: 'Free legal support for LGBTQ+ discrimination and family law cases.', topicIds: ['lgbtq'] },

  { id: 'careline-research-fund', name: 'CareLine Research Fund', description: 'Funds early-stage clinical trials for underfunded chronic diseases.', topicIds: ['medical-diseases'] },
  { id: 'patient-bridge-network', name: 'Patient Bridge Network', description: 'Covers travel and lodging costs for patients seeking specialist treatment.', topicIds: ['medical-diseases'] },

  { id: 'steady-mind-collective', name: 'Steady Mind Collective', description: 'Free short-term counseling for people who can’t afford therapy.', topicIds: ['mental-health'] },
  { id: 'lifeline-peer-support', name: 'Lifeline Peer Support', description: 'Trains and funds peer-support counselors in crisis-response teams.', topicIds: ['mental-health'] },

  { id: 'daily-bread-alliance', name: 'Daily Bread Alliance', description: 'Runs food pantries and mobile grocery routes in food-insecure areas.', topicIds: ['poverty'] },
  { id: 'bridge-forward-fund', name: 'Bridge Forward Fund', description: 'Emergency cash grants to prevent eviction, utility shutoffs, and job loss spirals.', topicIds: ['poverty'] },

  { id: 'justice-forward-project', name: 'Justice Forward Project', description: 'Legal defense fund for wrongful conviction and sentencing-reform cases.', topicIds: ['racial-justice'] },
  { id: 'equity-in-policing-fund', name: 'Equity in Policing Fund', description: 'Researches and advocates for accountability reforms in local police departments.', topicIds: ['racial-justice'] },

  { id: 'welcome-home-refugees', name: 'Welcome Home Refugees', description: 'Resettlement support: housing, job placement, and language classes.', topicIds: ['refugees'] },
  { id: 'displaced-families-fund', name: 'Displaced Families Fund', description: 'Emergency aid for families fleeing conflict zones, delivered within days.', topicIds: ['refugees'] },

  { id: 'common-cause-collective', name: 'Common Cause Collective', description: 'Organizes grassroots campaigns on civil rights and community accountability.', topicIds: ['social-justice'] },
  { id: 'people-first-alliance', name: 'People First Alliance', description: 'Trains community organizers and funds local advocacy campaigns.', topicIds: ['social-justice'] },

  { id: 'homefront-support-corps', name: 'Homefront Support Corps', description: 'Job placement and housing assistance for veterans transitioning to civilian life.', topicIds: ['veterans'] },
  { id: 'valor-health-fund', name: 'Valor Health Fund', description: 'Covers gaps in mental health and disability care not met by the VA.', topicIds: ['veterans'] },

  { id: 'every-voter-project', name: 'Every Voter Project', description: 'Nonpartisan voter registration and ballot-access support in underserved areas.', topicIds: ['voting-rights'] },
  { id: 'clear-ballot-fund', name: 'Clear Ballot Fund', description: 'Legal fund fighting restrictive voting laws in state courts.', topicIds: ['voting-rights'] },

  { id: 'shecan-legal-fund', name: 'SheCan Legal Fund', description: 'Legal aid for workplace discrimination and reproductive rights cases.', topicIds: ['womens-rights'] },
  { id: 'rise-together-network', name: 'Rise Together Network', description: 'Mentorship and small-business grants for women rebuilding after crisis.', topicIds: ['womens-rights'] },

  { id: 'safehouse-child-fund', name: 'Safehouse Child Fund', description: 'Emergency foster placements and family reunification casework.', topicIds: ['childrens-services'] },
  { id: 'guardian-corps', name: 'Guardian Corps', description: 'Trains volunteer court advocates for children in the foster system.', topicIds: ['childrens-services'] },
];

export function getNonprofitsForTopic(topicId: string): Nonprofit[] {
  return NONPROFITS.filter((nonprofit) => nonprofit.topicIds.includes(topicId));
}
