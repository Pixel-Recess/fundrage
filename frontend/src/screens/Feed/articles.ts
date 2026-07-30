export interface Article {
  id: string;
  headline: string;
  /** Short preview snippet shown under the headline (Figma's updated "News" frame, 3015:2569). */
  preview: string;
  /** Full mock article text, shown on the in-app reader (ArticleReader) after tapping through
   * from the preview card — mock content only, no real ingestion yet (Phase 2 per
   * docs/fundrage-backend-spec.md §4.1–4.2). */
  body: string[];
  topicId: string;
  sourceId: string;
  /** Set when this article came from the real /dev/news endpoint instead of this mock list —
   * ArticleReader shows a "read the real thing" link instead of the mock body paragraphs. */
  live?: boolean;
  canonicalUrl?: string;
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
    body: [
      'Volunteer groups across the region say they are stretching thin as a third wildfire this month forces new evacuations, with shelters reporting steady arrivals through the night. Emergency coordinators have asked residents outside the evacuation zones to hold off on self-deploying and instead donate through vetted relief organizations.',
      'Donations have surged in the past 48 hours, but officials caution that funding gaps typically widen weeks after a fire is contained, once initial media attention fades and displaced families still need housing support.',
    ],
    topicId: 'disaster-relief',
    sourceId: 'cnn',
  },
  {
    id: 'a2',
    headline: 'New shelters open for families displaced by flooding',
    preview: 'Three emergency shelters opened overnight as floodwaters kept rising along the river basin.',
    body: [
      'Three emergency shelters opened overnight as floodwaters kept rising along the river basin, displacing dozens of families from low-lying neighborhoods. Local officials say the shelters have capacity for several hundred more residents if water levels continue to climb through the weekend.',
      'Relief organizations are prioritizing supplies for infants and elderly residents, who make up a disproportionate share of those displaced so far. Road closures are complicating supply deliveries to two of the three shelter sites.',
    ],
    topicId: 'disaster-relief',
    sourceId: 'apple-news',
  },
  {
    id: 'a3',
    headline: 'Gap in equal pay narrows in tech sector, report finds',
    preview: 'A new industry survey shows the wage gap closing faster in tech than in any other sector.',
    body: [
      'A new industry survey shows the wage gap closing faster in tech than in any other sector, driven largely by pay transparency laws adopted in several states over the past two years. Median pay differences for comparable roles narrowed by several percentage points year over year.',
      'Advocates caution the gains are uneven across seniority levels, with the biggest improvements concentrated in entry- and mid-level roles rather than executive positions, where disparities remain largely unchanged.',
    ],
    topicId: 'equal-pay',
    sourceId: 'nyt',
  },
  {
    id: 'a4',
    headline: 'State lawmakers push new gun control legislation',
    preview: 'The bill would expand background checks and close a loophole for private sales.',
    body: [
      'The bill would expand background checks and close a loophole that currently allows some private sales to proceed without a review. Sponsors say the measure is modeled on legislation passed in neighboring states over the past several years.',
      'Opponents argue the changes would burden lawful gun owners without meaningfully affecting access for those seeking to evade existing checks. A committee vote is expected before the end of the current legislative session.',
    ],
    topicId: 'gun-control',
    sourceId: 'washington-post',
  },
  {
    id: 'a5',
    headline: 'City council votes to expand affordable housing',
    preview: 'The plan adds 1,200 units over five years, funded partly by a new developer fee.',
    body: [
      'The plan adds 1,200 units over five years, funded partly by a new fee assessed on large residential developments within city limits. Council members who backed the measure say it targets a growing gap between wages and rents in the metro area.',
      'Developer groups have signaled they may challenge the fee structure, arguing it will slow overall housing production even as it funds a smaller share of subsidized units.',
    ],
    topicId: 'housing',
    sourceId: 'local-news',
  },
  {
    id: 'a6',
    headline: 'School district rolls out free tutoring program',
    preview: 'The pilot targets students who fell behind during remote learning two years ago.',
    body: [
      'The pilot targets students who fell behind during remote learning two years ago, offering free after-school tutoring in reading and math at a dozen elementary schools. District officials say enrollment exceeded projections within the first week.',
      'The program is funded through a one-time grant that covers this school year only, and administrators say they are already exploring options to keep it running afterward.',
    ],
    topicId: 'education',
    sourceId: 'npr',
  },
  {
    id: 'a7',
    headline: 'Ocean plastic cleanup reaches new milestone',
    preview: 'Crews have now pulled over 10 million pounds of debris from the Pacific gyre.',
    body: [
      'Crews have now pulled over 10 million pounds of debris from the Pacific gyre since the cleanup effort began, according to the nonprofit coordinating the operation. Most of the material recovered is fragmented plastic too small to be reliably recycled.',
      'Organizers say the pace of collection has accelerated with newer equipment, but warn that ocean plastic accumulation still outpaces current cleanup capacity by a wide margin.',
    ],
    topicId: 'environment',
    sourceId: 'bbc',
  },
  {
    id: 'a8',
    headline: 'Border policy changes spark protests nationwide',
    preview: 'Demonstrators gathered in a dozen cities to oppose new asylum processing rules.',
    body: [
      'Demonstrators gathered in a dozen cities over the weekend to oppose new rules governing how asylum claims are processed at the border. Organizers say the changes would shorten review windows in ways that make it harder for applicants to gather supporting evidence.',
      'Federal officials defended the policy as necessary to reduce a growing case backlog, while advocacy groups have signaled they plan to challenge the rules in court.',
    ],
    topicId: 'immigration',
    sourceId: 'fox-news',
  },
  {
    id: 'a9',
    headline: 'Pride march draws record turnout downtown',
    preview: 'Organizers estimate this year’s march more than doubled last year’s attendance.',
    body: [
      'Organizers estimate this year’s march more than doubled last year’s attendance, with crowds lining the entire downtown route for the first time since the event resumed after a multi-year pause.',
      'City officials say road closures ran smoothly despite the larger turnout, and organizers are already planning a longer route for next year to accommodate continued growth.',
    ],
    topicId: 'lgbtq',
    sourceId: 'the-guardian',
  },
  {
    id: 'a10',
    headline: 'Breakthrough treatment shows promise in early trials',
    preview: 'Researchers report a 40% reduction in symptoms among trial participants.',
    body: [
      'Researchers report a 40% reduction in symptoms among trial participants in an early-phase study, describing the results as among the most promising seen for this condition in over a decade.',
      'The trial included a small cohort, and researchers caution that larger, longer studies are needed before the treatment could be considered for wider approval.',
    ],
    topicId: 'medical-diseases',
    sourceId: 'bloomberg',
  },
  {
    id: 'a11',
    headline: 'Community fridge program fights food insecurity',
    preview: 'A dozen neighborhood fridges now redistribute surplus food from local grocers.',
    body: [
      'A dozen neighborhood fridges now redistribute surplus food from local grocers and restaurants, giving anyone in the community free access to items that would otherwise be discarded.',
      'Volunteers who maintain the fridges say demand has grown steadily since the program launched, and they are now seeking donations to fund several additional locations across the city.',
    ],
    topicId: 'poverty',
    sourceId: 'local-news',
  },
  {
    id: 'a12',
    headline: 'Task force releases report on policing reform',
    preview: 'The report recommends new oversight measures after an 18-month review.',
    body: [
      'The report recommends new civilian oversight measures after an 18-month review of department practices, including an independent review board with subpoena power over misconduct investigations.',
      'City leaders say they will review the recommendations over the coming months, while community groups are pushing for an implementation timeline to be set immediately.',
    ],
    topicId: 'racial-justice',
    sourceId: 'nyt',
  },
  {
    id: 'a13',
    headline: 'Refugee resettlement agency seeks volunteers',
    preview: 'The agency expects to resettle twice as many families this year as last.',
    body: [
      'The agency expects to resettle twice as many families this year as last, and says it urgently needs volunteers to help with housing setup, English tutoring, and school enrollment for arriving children.',
      'Staff say the biggest current gap is furnished housing, with several families currently in temporary hotel placements while longer-term apartments are secured.',
    ],
    topicId: 'refugees',
    sourceId: 'npr',
  },
  {
    id: 'a14',
    headline: 'Advocates rally for voting access ahead of election',
    preview: 'Groups are pushing for extended early voting and more polling locations.',
    body: [
      'Groups are pushing for extended early voting hours and more polling locations in precincts that saw hours-long lines during the last election cycle.',
      'County election officials say they are reviewing the requests but note that adding locations this close to the election would require additional poll worker recruitment they have not yet secured.',
    ],
    topicId: 'voting-rights',
    sourceId: 'washington-post',
  },
  {
    id: 'a15',
    headline: 'Veterans clinic opens new mental health wing',
    preview: 'The expansion adds same-day counseling slots for veterans in crisis.',
    body: [
      'The expansion adds same-day counseling slots for veterans in crisis, addressing a wait-time gap clinic staff say has been a persistent barrier to care.',
      'The wing was funded largely through private donations after a multi-year fundraising campaign, and clinic administrators say they are already planning a second expansion for next year.',
    ],
    topicId: 'veterans',
    sourceId: 'apple-news',
  },
  {
    id: 'a16',
    headline: 'Animal shelter overwhelmed after storm, calls for help',
    preview: 'The shelter is over capacity after taking in more than 200 displaced pets.',
    body: [
      'The shelter is over capacity after taking in more than 200 displaced pets in the days following the storm, with staff converting office space into temporary kennel areas.',
      'The shelter is asking for foster volunteers and supply donations, particularly crates and pet food, as it works to reunite animals with owners and find placements for the rest.',
    ],
    topicId: 'animal-rights',
    sourceId: 'ap',
  },
  {
    id: 'a17',
    headline: 'Domestic violence hotline sees surge in calls',
    preview: 'Call volume is up 30% this quarter, straining an already thin staff of counselors.',
    body: [
      'Call volume is up 30% this quarter, straining an already thin staff of counselors who say wait times have grown longer than they would like during peak evening hours.',
      'The organization is recruiting and training additional volunteer counselors, but says it will take several months before new hires are fully certified to handle crisis calls independently.',
    ],
    topicId: 'domestic-violence',
    sourceId: 'cnn',
  },
  {
    id: 'a18',
    headline: 'Study links social media use to teen mental health',
    preview: 'The study followed 5,000 teens over three years to track usage and mood.',
    body: [
      'The study followed 5,000 teens over three years to track social media usage alongside self-reported mood and sleep data, finding a modest but consistent association between heavier use and reported anxiety.',
      'Researchers caution the study shows correlation, not causation, and say usage patterns likely interact with a range of other factors researchers are still working to isolate.',
    ],
    topicId: 'mental-health',
    sourceId: 'google-news',
  },
  {
    id: 'a19',
    headline: "Women's rights group challenges new state law",
    preview: 'The lawsuit argues the law disproportionately affects low-income women.',
    body: [
      'The lawsuit argues the law disproportionately affects low-income women who have fewer options to travel or access alternative services if the measure takes effect as written.',
      'State attorneys have signaled they will defend the law, setting up a court fight that legal observers expect could take months to resolve.',
    ],
    topicId: 'womens-rights',
    sourceId: 'nyt',
  },
  {
    id: 'a20',
    headline: 'Foster care system faces staffing shortage',
    preview: 'Caseworkers are managing double their recommended caseload, the state reports.',
    body: [
      'Caseworkers are managing double their recommended caseload, according to a new state report, raising concerns about how thoroughly at-risk cases can be monitored.',
      'The state has approved emergency funding for new hires, but officials say training a caseworker to full capacity typically takes the better part of a year.',
    ],
    topicId: 'childrens-services',
    sourceId: 'local-news',
  },
];
