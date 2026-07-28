export interface Source {
  id: string;
  label: string;
}

/**
 * Matches the shape of user_sources.source_slug in the backend schema
 * (supabase/migrations/20260708000001_schema.sql) — "declared consumption
 * environment," not a real integration list. Fresh for this screen; no
 * equivalent exists in the Figma prototype.
 */
export const SOURCES: Source[] = [
  { id: 'apple-news', label: 'Apple News' },
  { id: 'google-news', label: 'Google News' },
  { id: 'nyt', label: 'The New York Times' },
  { id: 'washington-post', label: 'The Washington Post' },
  { id: 'wsj', label: 'The Wall Street Journal' },
  { id: 'usa-today', label: 'USA Today' },
  { id: 'ap', label: 'Associated Press' },
  { id: 'reuters', label: 'Reuters' },
  { id: 'bloomberg', label: 'Bloomberg' },
  { id: 'cnn', label: 'CNN' },
  { id: 'fox-news', label: 'Fox News' },
  { id: 'msnbc', label: 'MSNBC' },
  { id: 'abc-news', label: 'ABC News' },
  { id: 'nbc-news', label: 'NBC News' },
  { id: 'cbs-news', label: 'CBS News' },
  { id: 'bbc', label: 'BBC News' },
  { id: 'the-guardian', label: 'The Guardian' },
  { id: 'al-jazeera', label: 'Al Jazeera' },
  { id: 'npr', label: 'NPR' },
  { id: 'politico', label: 'Politico' },
  { id: 'axios', label: 'Axios' },
  { id: 'the-atlantic', label: 'The Atlantic' },
  { id: 'local-news', label: 'Local News' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'newsletters', label: 'Newsletters (Substack, etc.)' },
];
