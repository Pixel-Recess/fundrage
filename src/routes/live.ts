import type { FastifyInstance } from "fastify";
import { fetchRssCandidates } from "../ingestion/rss.js";
import { RSS_FEEDS } from "../ingestion/rssFeeds.js";
import { searchNonprofits, type EveryOrgNonprofit } from "../infra/everyOrg.js";
import type { NewsCandidate } from "../ingestion/types.js";

/**
 * Experimental, unauthenticated, no-persistence routes for trying real news/charity data in the
 * frontend demo. Not part of the real spec'd API surface (no auth, no DB/KV writes) — see the
 * "Live news + live charity data" plan for scope and rationale. Topic matching here is a simple
 * keyword heuristic, explicitly NOT the real Phase 2 LLM classifier/velocity engine.
 */
const TOPIC_INFO: Record<string, { keywords: string[]; searchTerm: string }> = {
  "animal-rights": {
    keywords: ["animal", "wildlife", "pet", "shelter"],
    searchTerm: "animal welfare",
  },
  "disaster-relief": {
    keywords: [
      "wildfire",
      "flood",
      "hurricane",
      "storm",
      "disaster",
      "evacuat",
    ],
    searchTerm: "disaster relief",
  },
  "domestic-violence": {
    keywords: ["domestic violence", "abuse", "hotline"],
    searchTerm: "domestic violence",
  },
  education: {
    keywords: ["school", "student", "tutoring", "education"],
    searchTerm: "education",
  },
  environment: {
    keywords: ["climate", "environment", "ocean", "plastic", "conservation"],
    searchTerm: "environment",
  },
  "equal-pay": {
    keywords: ["wage gap", "equal pay", "pay gap"],
    searchTerm: "equal pay",
  },
  "gun-control": {
    keywords: ["gun", "firearm", "background check"],
    searchTerm: "gun violence prevention",
  },
  housing: {
    keywords: ["housing", "rent", "affordable housing", "homeless"],
    searchTerm: "housing",
  },
  immigration: {
    keywords: ["immigra", "asylum", "border", "migrant"],
    searchTerm: "immigration",
  },
  lgbtq: {
    keywords: ["lgbtq", "pride", "transgender", "gay"],
    searchTerm: "lgbtq",
  },
  "medical-diseases": {
    keywords: ["disease", "treatment", "clinical trial", "diagnosis"],
    searchTerm: "medical research",
  },
  "mental-health": {
    keywords: ["mental health", "anxiety", "depression", "counseling"],
    searchTerm: "mental health",
  },
  poverty: {
    keywords: ["poverty", "food insecurity", "food bank", "low-income"],
    searchTerm: "poverty",
  },
  "racial-justice": {
    keywords: ["racial justice", "policing", "civil rights"],
    searchTerm: "racial justice",
  },
  refugees: {
    keywords: ["refugee", "resettlement", "displaced"],
    searchTerm: "refugees",
  },
  "social-justice": {
    keywords: ["social justice", "advocacy", "civil rights"],
    searchTerm: "social justice",
  },
  veterans: {
    keywords: ["veteran", "military", " va "],
    searchTerm: "veterans",
  },
  "voting-rights": {
    keywords: ["voting", "ballot", "election", "voter"],
    searchTerm: "voting rights",
  },
  "womens-rights": {
    keywords: ["women", "reproductive", "gender"],
    searchTerm: "womens rights",
  },
  "childrens-services": {
    keywords: ["foster care", "child welfare", "children"],
    searchTerm: "children's welfare",
  },
};

function matchesTopic(text: string, topicId: string): boolean {
  const info = TOPIC_INFO[topicId];
  if (!info) return false;
  const lower = text.toLowerCase();
  return info.keywords.some((keyword) => lower.includes(keyword));
}

export interface LiveRoutesDeps {
  everyOrgApiKey?: string | undefined;
  /** Test seam — defaults to the real RSS fetch, same pattern as AppDeps.verifyAppleToken. */
  fetchNews?: (() => Promise<NewsCandidate[]>) | undefined;
  /** Test seam — defaults to the real Every.org client. */
  searchCharities?:
    | ((
        searchTerm: string,
        apiKey: string,
        take: number,
      ) => Promise<EveryOrgNonprofit[]>)
    | undefined;
}

export function registerLiveRoutes(
  app: FastifyInstance,
  deps: LiveRoutesDeps,
): void {
  const fetchNews = deps.fetchNews ?? (() => fetchRssCandidates(RSS_FEEDS));
  const searchCharities = deps.searchCharities ?? searchNonprofits;

  app.get<{ Querystring: { topics?: string } }>("/dev/news", async (req) => {
    const topics = (req.query.topics ?? "").split(",").filter(Boolean);
    const candidates = await fetchNews();

    const withTopics = candidates.map((c) => ({
      candidate: c,
      matchedTopics: topics.filter((topicId) =>
        matchesTopic(`${c.headline} ${c.summary ?? ""}`, topicId),
      ),
    }));
    const matched =
      topics.length === 0
        ? withTopics
        : withTopics.filter((c) => c.matchedTopics.length > 0);

    return {
      live: true,
      note: "Real headlines/summaries from public RSS feeds — topic matching is a keyword heuristic, not the real classifier.",
      articles: matched.map(({ candidate, matchedTopics }) => ({
        headline: candidate.headline,
        summary: candidate.summary ?? "",
        canonicalUrl: candidate.canonicalUrl,
        sourceSlug: candidate.sourceSlug,
        publishedAt: candidate.publishedAt.toISOString(),
        imageUrl: candidate.imageUrl ?? null,
        matchedTopics,
      })),
    };
  });

  app.get<{ Querystring: { topic?: string } }>(
    "/dev/charities",
    async (req, reply) => {
      if (!deps.everyOrgApiKey) {
        return reply
          .code(503)
          .send({ error: "EVERY_ORG_API_KEY is not configured" });
      }
      const topicId = req.query.topic;
      const info = topicId ? TOPIC_INFO[topicId] : undefined;
      const searchTerm = info?.searchTerm ?? topicId ?? "charity";

      const nonprofits = await searchCharities(
        searchTerm,
        deps.everyOrgApiKey,
        10,
      );
      return {
        live: true,
        note: "Real nonprofit names from Every.org's public search API. Charity Navigator rating is NOT independently verified in this demo.",
        nonprofits,
      };
    },
  );
}
