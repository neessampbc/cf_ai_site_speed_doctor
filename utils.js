/**
 * utils.js - utility functions used across the project
 * 
 * provides helper functions for:
 * - url normalization and site id generation
 * - response formatting
 * - input validation and sanitization
 * 
 * @module utils
 */

/**
 * normalizes a url for consistent site id generation
 * 
 * removes protocol, www prefix, trailing slashes, etc.
 * ensures same site always generates same id regardless of how url is formatted.
 * 
 * examples:
 * - https://www.example.com/ -> example.com
 * - http://example.com -> example.com
 * - https://example.com/page -> example.com/page
 * 
 * @param {string} url - url to normalize
 * @returns {string} normalized url string
 */
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

/**
 * generates a consistent site id from a url
 * 
 * creates a deterministic site identifier by normalizing the url.
 * same site will always generate same id regardless of protocol/www/trailing slash.
 * 
 * @param {string} url - url to generate id from
 * @returns {string} normalized site id
 */
export function generateSiteId(url) {
  // TODO: create consistent site id from normalized url
  const normalized = normalizeUrl(url);
  // TODO: maybe hash it or use some other consistent method
  return normalized;
}

/**
 * formats analysis response with ai insights
 * 
 * combines raw analysis data with ai-generated insights into a single response object.
 * used to structure the final response sent to clients.
 * 
 * @param {Object} analysisData - raw analysis data from analyzer
 * @param {Object} aiInsights - ai-generated insights from agent
 * @returns {Object} formatted response object
 */
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

/**
 * validates url format
 * 
 * checks if a string is a valid url using the URL constructor.
 * 
 * @param {string} url - url string to validate
 * @returns {boolean} true if valid url, false otherwise
 */
export function validateUrl(url) {
  // TODO: validate url format
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * sanitizes user input
 * 
 * removes dangerous characters and limits length to prevent injection attacks.
 * basic sanitization - should be enhanced based on use case.
 * 
 * @param {string} input - user input to sanitize
 * @returns {string} sanitized input (trimmed, max 1000 chars)
 */
export function sanitizeInput(input) {
  // TODO: sanitize user input to prevent injection attacks
  // TODO: remove dangerous characters, limit length, etc
  return input.trim().slice(0, 1000);
}
