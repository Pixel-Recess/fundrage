import animalRights from '../../assets/photos/topics/animal-rights.png';
import disasterRelief from '../../assets/photos/topics/disaster-relief.png';
import domesticViolence from '../../assets/photos/topics/domestic-violence.png';
import education from '../../assets/photos/topics/education.png';
import environment from '../../assets/photos/topics/environment.png';
import equalPay from '../../assets/photos/topics/equal-pay.png';
import gunControl from '../../assets/photos/topics/gun-control.png';
import housing from '../../assets/photos/topics/housing.png';
import immigration from '../../assets/photos/topics/immigration.png';
import lgbtq from '../../assets/photos/topics/lgbtq.png';
import medicalDiseases from '../../assets/photos/topics/medical-diseases.png';
import mentalHealth from '../../assets/photos/topics/mental-health.png';
import poverty from '../../assets/photos/topics/poverty.png';
import racialJustice from '../../assets/photos/topics/racial-justice.png';
import refugees from '../../assets/photos/topics/refugees.png';
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
 * 1:1 (labels, order, photos). Every topic now has its own distinct photo — the
 * earlier "Equal Pay reuses Disaster Relief" / "Refugees reuses Medical Diseases"
 * findings turned out to be a bug in how the Figma MCP tool resolved shared
 * variable names across nodes, not an actual repeat in the design (confirmed by
 * pulling each node's rendered composite directly instead of trusting the
 * aggregated code dump). The .png files are Figma's own rendered exports
 * (mask + crop already applied); the .jpg files are raw source images for the
 * few topics whose nodes wouldn't render an isolated export.
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
