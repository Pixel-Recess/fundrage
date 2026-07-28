export interface Receipt {
  id: string;
  nonprofitName: string;
  date: string;
  amount: number;
  /** Apple Pay's masked card display name — never real card data, see CLAUDE.md §1. */
  cardLabel: string;
  cardExpiry: string;
}

/**
 * Mock receipt history for the demo only — there's no real donation flow yet
 * (selecting a nonprofit doesn't do anything real, see NonprofitsFromArticle),
 * so these are fictional past donations to nonprofits already established in
 * NONPROFITS (nonprofits.ts), not invented one-off names, for continuity across
 * the demo. cardLabel/cardExpiry mock what Apple Pay's PKPaymentToken would
 * surface for a receipt display — FundRage never sees real card data (§1).
 */
export const RECEIPTS: Receipt[] = [
  {
    id: 'r1',
    nonprofitName: 'Greenline Conservancy',
    date: 'July 12, 2026',
    amount: 10,
    cardLabel: 'Mastercard ending in 4444',
    cardExpiry: '2/28',
  },
  {
    id: 'r2',
    nonprofitName: 'Rapid Relief Network',
    date: 'June 24, 2026',
    amount: 5,
    cardLabel: 'Mastercard ending in 4444',
    cardExpiry: '2/28',
  },
  {
    id: 'r3',
    nonprofitName: 'Blue Current Project',
    date: 'May 3, 2026',
    amount: 25,
    cardLabel: 'Mastercard ending in 4444',
    cardExpiry: '2/28',
  },
  {
    id: 'r4',
    nonprofitName: 'Wildlife First Response',
    date: 'March 19, 2026',
    amount: 10,
    cardLabel: 'Mastercard ending in 4444',
    cardExpiry: '2/28',
  },
  {
    id: 'r5',
    nonprofitName: 'Brightpath Tutoring Corps',
    date: 'February 27, 2026',
    amount: 5,
    cardLabel: 'Mastercard ending in 4444',
    cardExpiry: '2/28',
  },
];
