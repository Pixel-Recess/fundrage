import animalRights from '../../assets/photos/topics/animal-rights.jpg';
import disasterRelief from '../../assets/photos/topics/disaster-relief.jpg';
import domesticViolence from '../../assets/photos/topics/domestic-violence.jpg';
import education from '../../assets/photos/topics/education.jpg';
import environment from '../../assets/photos/topics/environment.jpg';
import equalPay from '../../assets/photos/topics/equal-pay.jpg';
import gunControl from '../../assets/photos/topics/gun-control.jpg';
import housing from '../../assets/photos/topics/housing.jpg';
import immigration from '../../assets/photos/topics/immigration.jpg';
import lgbtq from '../../assets/photos/topics/lgbtq.jpg';
import medicalDiseases from '../../assets/photos/topics/medical-diseases.jpg';
import mentalHealth from '../../assets/photos/topics/mental-health.jpg';
import poverty from '../../assets/photos/topics/poverty.jpg';
import racialJustice from '../../assets/photos/topics/racial-justice.jpg';
import refugees from '../../assets/photos/topics/refugees.jpg';
import socialJustice from '../../assets/photos/topics/social-justice.jpg';
import veterans from '../../assets/photos/topics/veterans.jpg';
import votingRights from '../../assets/photos/topics/voting-rights.jpg';
import womensRightsPhoto from '../../assets/photos/topics/womens-rights.jpg';
import childrensServicesPhoto from '../../assets/photos/topics/childrens-services.jpg';

export interface Topic {
  id: string;
  label: string;
  photo: string;
}

/**
 * Mirrors the "Topics-Option_Photos" / "Topics-Option_Photos-Selcted" Figma frames
 * 1:1 (labels, order, photos). All photos are now the real high-resolution source
 * images (mostly real Unsplash stock photos per the design's own EXIF metadata),
 * pulled from Figma's raw image fills rather than the ~100px flattened tile
 * exports previously checked in here — those were fine at the old fixed 100px
 * tile size but looked soft once tiles became fully fluid (no more max-width cap).
 *
 * Sourcing individual per-topic fills this way (rather than trusting the
 * aggregated whole-page code dump) also matters because the dump's asset
 * variables get reused/aliased incorrectly across visually-similar component
 * instances — confirmed again this pass (equal-pay, refugees, housing, and
 * mental-health all initially resolved to another topic's photo in the
 * aggregated dump; each was re-fetched scoped to its own node and verified by
 * eye before being used).
 *
 * This list does NOT match either the earlier icon-based "Topics-Option_Icons" list
 * or supabase/migrations/20260708000002_seed_topics.sql — three different topic
 * lists now exist across the design and backend and need reconciling.
 */
export const TOPICS: Topic[] = [
  { id: 'animal-rights', label: 'Animal Rights', photo: animalRights },
  { id: 'disaster-relief', label: 'Disaster Relief', photo: disasterRelief },
  { id: 'domestic-violence', label: 'Domestic Violence', photo: domesticViolence },
  { id: 'education', label: 'Education', photo: education },
  { id: 'environment', label: 'Environment', photo: environment },
  { id: 'equal-pay', label: 'Equal Pay', photo: equalPay },
  { id: 'gun-control', label: 'Gun Control', photo: gunControl },
  { id: 'housing', label: 'Housing', photo: housing },
  { id: 'immigration', label: 'Immigration', photo: immigration },
  { id: 'lgbtq', label: 'LGBTQ+', photo: lgbtq },
  { id: 'medical-diseases', label: 'Medical Diseases', photo: medicalDiseases },
  { id: 'mental-health', label: 'Mental Health', photo: mentalHealth },
  { id: 'poverty', label: 'Poverty', photo: poverty },
  { id: 'racial-justice', label: 'Racial Justice', photo: racialJustice },
  { id: 'refugees', label: 'Refugees', photo: refugees },
  { id: 'social-justice', label: 'Social Justice', photo: socialJustice },
  { id: 'veterans', label: 'Veterans', photo: veterans },
  { id: 'voting-rights', label: 'Voting Rights', photo: votingRights },
  { id: 'womens-rights', label: 'Women’s Rights', photo: womensRightsPhoto },
  { id: 'childrens-services', label: 'Children’s Services', photo: childrensServicesPhoto },
];
