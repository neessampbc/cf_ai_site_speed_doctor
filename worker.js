// main worker entry point - handles routing and coordinates between ai agent and durable objects

import { SiteAnalyzer } from './analyzer.js';
import { SpeedDoctorAgent } from './agent.js';
import { generateSiteId } from './utils.js';
import { SpeedDoctorDurableObject } from './durable.js';

// export durable object class for binding
export { SpeedDoctorDurableObject };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // handle api routes
    if (path.startsWith('/api/')) {
      return handleApiRequest(request, env, ctx);
    }

    // serve frontend for pages
    return new Response('frontend should be served via pages', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // route: /api/analyze - start new site analysis
  if (path === '/api/analyze' && request.method === 'POST') {
    return handleAnalyze(request, env, ctx);
  }

  // route: /api/chat - chat with ai agent about site performance
  if (path === '/api/chat' && request.method === 'POST') {
    return handleChat(request, env, ctx);
  }

  // route: /api/history/:siteId - get analysis history for a site
  if (path.startsWith('/api/history/') && request.method === 'GET') {
    return handleHistory(request, env, ctx);
  }

  return new Response('not found', { status: 404 });
}

async function handleAnalyze(request, env, ctx) {
  try {
    const body = await request.json();
    const { siteUrl } = body;

    if (!siteUrl) {
      return new Response(JSON.stringify({ error: 'site url required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // get or create durable object for this site
    const siteId = generateSiteId(siteUrl);
    const durableObjectId = env.SPEED_DOCTOR.idFromName(siteId);
    const durableObject = env.SPEED_DOCTOR.get(durableObjectId);

    // forward request to durable object
    const response = await durableObject.fetch(request);

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleChat(request, env, ctx) {
  try {
    const body = await request.json();
    const { siteId, message } = body;

    if (!siteId || !message) {
      return new Response(JSON.stringify({ error: 'site id and message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // get durable object for this site
    const durableObjectId = env.SPEED_DOCTOR.idFromName(siteId);
    const durableObject = env.SPEED_DOCTOR.get(durableObjectId);

    // forward chat request to durable object
    const response = await durableObject.fetch(request);

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleHistory(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const siteId = url.pathname.split('/api/history/')[1];

    if (!siteId) {
      return new Response(JSON.stringify({ error: 'site id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // get durable object for this site
    const durableObjectId = env.SPEED_DOCTOR.idFromName(siteId);
    const durableObject = env.SPEED_DOCTOR.get(durableObjectId);

    // forward history request to durable object
    const response = await durableObject.fetch(request);

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


