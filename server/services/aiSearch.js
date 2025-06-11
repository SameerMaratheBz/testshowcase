import { searchSimilarAds } from './embeddings.js';

export async function searchAds(query, ads) {
  try {
    // Use vector similarity search
    const results = await searchSimilarAds(query);
    return results.length > 0 ? results : ads;
  } catch (error) {
    console.error('Error in vector search:', error);
    // Fallback to original search if vector search fails
    return fallbackSearch(query, ads);
  }
}

// Fallback keyword-based search
function fallbackSearch(query, ads) {
  const WEIGHTS = {
    industry: 3,
    advertiser: 2,
    format: 2,
    features: 1
  };

  function tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  function calculateRelevanceScore(query, ad) {
    const queryTokens = tokenize(query);
    let score = 0;

    if (ad.industry) {
      const industryTokens = tokenize(ad.industry);
      const industryMatch = queryTokens.some(token => 
        industryTokens.some(indToken => indToken.includes(token))
      );
      if (industryMatch) score += WEIGHTS.industry;
    }

    if (ad.advertiser) {
      const advertiserTokens = tokenize(ad.advertiser);
      const advertiserMatch = queryTokens.some(token => 
        advertiserTokens.some(advToken => advToken.includes(token))
      );
      if (advertiserMatch) score += WEIGHTS.advertiser;
    }

    if (ad.format) {
      const formatTokens = tokenize(ad.format);
      const formatMatch = queryTokens.some(token => 
        formatTokens.some(fmtToken => fmtToken.includes(token))
      );
      if (formatMatch) score += WEIGHTS.format;
    }

    if (ad.featureFlags.length > 0) {
      const featureTokens = ad.featureFlags.flatMap(feature => tokenize(feature));
      const featureMatches = queryTokens.filter(token => 
        featureTokens.some(featToken => featToken.includes(token))
      ).length;
      score += featureMatches * WEIGHTS.features;
    }

    return score;
  }

  const scoredAds = ads.map(ad => ({
    ...ad,
    score: calculateRelevanceScore(query, ad)
  }));

  const results = scoredAds
    .filter(ad => ad.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...ad }) => ad);

  return results.length > 0 ? results : ads;
}
