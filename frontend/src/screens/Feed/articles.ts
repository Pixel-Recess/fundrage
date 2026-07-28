export interface Article {
  id: string;
  headline: string;
  /** Short preview snippet shown under the headline (Figma's updated "News" frame, 3015:2569). */
  preview: string;
  topicId: string;
  sourceId: string;
}

/**
 * Mock article data for the demo feed only — no real ingestion, matching,
 * or velocity logic behind this (that's Phase 2, per docs/fundrage-backend-spec.md
 * §4.1–4.3). topicId/sourceId reference TopicSelection's TOPICS and
 * SourceSelection's SOURCES ids so the feed can filter by what the user picked.
 */
export const ARTICLES: Article[] = [
  {
    id: 'a1',
    headline: 'Wildfire relief effort expands as donations surge',
    preview: 'Volunteer groups are stretching thin as a third wildfire this month forces new evacuations.',
    topicId: 'disaster-relief',
    sourceId: 'cnn',
  },
  {
    id: 'a2',
    headline: 'New shelters open for families displaced by flooding',
    preview: 'Three emergency shelters opened overnight as floodwaters kept rising along the river basin.',
    topicId: 'disaster-relief',
    sourceId: 'apple-news',
  },
  {
    id: 'a3',
    headline: 'Gap in equal pay narrows in tech sector, report finds',
    preview: 'A new industry survey shows the wage gap closing faster in tech than in any other sector.',
    topicId: 'equal-pay',
    sourceId: 'nyt',
  },
  {
    id: 'a4',
    headline: 'State lawmakers push new gun control legislation',
    preview: 'The bill would expand background checks and close a loophole for private sales.',
    topicId: 'gun-control',
    sourceId: 'washington-post',
  },
  {
    id: 'a5',
    headline: 'City council votes to expand affordable housing',
    preview: 'The plan adds 1,200 units over five years, funded partly by a new developer fee.',
    topicId: 'housing',
    sourceId: 'local-news',
  },
  {
    id: 'a6',
    headline: 'School district rolls out free tutoring program',
    preview: 'The pilot targets students who fell behind during remote learning two years ago.',
    topicId: 'education',
    sourceId: 'npr',
  },
  {
    id: 'a7',
    headline: 'Ocean plastic cleanup reaches new milestone',
    preview: 'Crews have now pulled over 10 million pounds of debris from the Pacific gyre.',
    topicId: 'environment',
    sourceId: 'bbc',
  },
  {
    id: 'a8',
    headline: 'Border policy changes spark protests nationwide',
    preview: 'Demonstrators gathered in a dozen cities to oppose new asylum processing rules.',
    topicId: 'immigration',
    sourceId: 'fox-news',
  },
  {
    id: 'a9',
    headline: 'Pride march draws record turnout downtown',
    preview: 'Organizers estimate this year’s march more than doubled last year’s attendance.',
    topicId: 'lgbtq',
    sourceId: 'the-guardian',
  },
  {
    id: 'a10',
    headline: 'Breakthrough treatment shows promise in early trials',
    preview: 'Researchers report a 40% reduction in symptoms among trial participants.',
    topicId: 'medical-diseases',
    sourceId: 'bloomberg',
  },
  {
    id: 'a11',
    headline: 'Community fridge program fights food insecurity',
    preview: 'A dozen neighborhood fridges now redistribute surplus food from local grocers.',
    topicId: 'poverty',
    sourceId: 'local-news',
  },
  {
    id: 'a12',
    headline: 'Task force releases report on policing reform',
    preview: 'The report recommends new oversight measures after an 18-month review.',
    topicId: 'racial-justice',
    sourceId: 'nyt',
  },
  {
    id: 'a13',
    headline: 'Refugee resettlement agency seeks volunteers',
    preview: 'The agency expects to resettle twice as many families this year as last.',
    topicId: 'refugees',
    sourceId: 'npr',
  },
  {
    id: 'a14',
    headline: 'Advocates rally for voting access ahead of election',
    preview: 'Groups are pushing for extended early voting and more polling locations.',
    topicId: 'voting-rights',
    sourceId: 'washington-post',
  },
  {
    id: 'a15',
    headline: 'Veterans clinic opens new mental health wing',
    preview: 'The expansion adds same-day counseling slots for veterans in crisis.',
    topicId: 'veterans',
    sourceId: 'apple-news',
  },
  {
    id: 'a16',
    headline: 'Animal shelter overwhelmed after storm, calls for help',
    preview: 'The shelter is over capacity after taking in more than 200 displaced pets.',
    topicId: 'animal-rights',
    sourceId: 'ap',
  },
  {
    id: 'a17',
    headline: 'Domestic violence hotline sees surge in calls',
    preview: 'Call volume is up 30% this quarter, straining an already thin staff of counselors.',
    topicId: 'domestic-violence',
    sourceId: 'cnn',
  },
  {
    id: 'a18',
    headline: 'Study links social media use to teen mental health',
    preview: 'The study followed 5,000 teens over three years to track usage and mood.',
    topicId: 'mental-health',
    sourceId: 'google-news',
  },
  {
    id: 'a19',
    headline: "Women's rights group challenges new state law",
    preview: 'The lawsuit argues the law disproportionately affects low-income women.',
    topicId: 'womens-rights',
    sourceId: 'nyt',
  },
  {
    id: 'a20',
    headline: 'Foster care system faces staffing shortage',
    preview: 'Caseworkers are managing double their recommended caseload, the state reports.',
    topicId: 'childrens-services',
    sourceId: 'local-news',
  },
];
