// utility functions used across the project

export function normalizeUrl(url) {
  // TODO: normalize url for consistent site id generation
  // remove protocol, www, trailing slashes, etc
  try {
    const urlObj = new URL(url);
    let normalized = urlObj.hostname + urlObj.pathname;
    normalized = normalized.replace(/^www\./, '');
    normalized = normalized.replace(/\/$/, '');
    return normalized;
  } catch (error) {
    return url;
  }
}

export function generateSiteId(url) {
  // TODO: create consistent site id from normalized url
  const normalized = normalizeUrl(url);
  // TODO: maybe hash it or use some other consistent method
  return normalized;
}

export function formatAnalysisResponse(analysisData, aiInsights) {
  // TODO: combine raw analysis data with ai insights
  // TODO: format into user-friendly response
  return {
    siteId: generateSiteId(analysisData.url),
    url: analysisData.url,
    timestamp: analysisData.timestamp,
    metrics: analysisData.metrics,
    coreWebVitals: analysisData.coreWebVitals,
    caching: analysisData.caching,
    assets: analysisData.assets,
    cloudflare: analysisData.cloudflare,
    insights: aiInsights
  };
}

export function validateUrl(url) {
  // TODO: validate url format
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input) {
  // TODO: sanitize user input to prevent injection attacks
  // TODO: remove dangerous characters, limit length, etc
  return input.trim().slice(0, 1000);
}

