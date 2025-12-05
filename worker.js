/**
 * worker.js - main cloudflare worker entry point
 * 
 * this worker handles all incoming requests and routes them appropriately:
 * - api routes (/api/*) are handled by specific handlers
 * - all other routes return a message indicating frontend should be served via pages
 * 
 * architecture:
 * - worker receives request and determines route
 * - for analyze/chat/history routes, creates/gets durable object for the site
 * - forwards request to durable object which handles the actual logic
 * - durable objects maintain state per site (analysis history, chat context)
 * 
 * @module worker
 */

import { SiteAnalyzer } from './analyzer.js';
import { SpeedDoctorAgent } from './agent.js';
import { generateSiteId } from './utils.js';
import { SpeedDoctorDurableObject } from './durable.js';

// export durable object class for cloudflare workers binding
// this allows wrangler.toml to bind the durable object to this worker
export { SpeedDoctorDurableObject };

/**
 * main worker fetch handler
 * 
 * handles all incoming requests and routes them to appropriate handlers.
 * api routes go to handleApiRequest, everything else returns a message about pages.
 * 
 * @param {Request} request - the incoming request
 * @param {Object} env - cloudflare workers environment (bindings, secrets, etc)
 * @param {ExecutionContext} ctx - execution context for the request
 * @returns {Promise<Response>} response to send back to client
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // handle api routes - these go to the api handler
    if (path.startsWith('/api/')) {
      return handleApiRequest(request, env, ctx);
    }

    // all other routes - frontend should be served via cloudflare pages
    // this worker only handles api endpoints
    return new Response('frontend should be served via pages', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

/**
 * handles all api route requests
 * 
 * routes requests to specific handlers based on path and method:
 * - POST /api/analyze -> handleAnalyze
 * - POST /api/chat -> handleChat
 * - GET /api/history/:siteId -> handleHistory
 * 
 * @param {Request} request - the incoming api request
 * @param {Object} env - cloudflare workers environment
 * @param {ExecutionContext} ctx - execution context
 * @returns {Promise<Response>} response from the appropriate handler or 404
 */
async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // route: POST /api/analyze - start new site analysis
  if (path === '/api/analyze' && request.method === 'POST') {
    return handleAnalyze(request, env, ctx);
  }

  // route: POST /api/chat - chat with ai agent about site performance
  if (path === '/api/chat' && request.method === 'POST') {
    return handleChat(request, env, ctx);
  }

  // route: GET /api/history/:siteId - get analysis history for a site
  if (path.startsWith('/api/history/') && request.method === 'GET') {
    return handleHistory(request, env, ctx);
  }

  // unknown api route
  return new Response('not found', { status: 404 });
}

/**
 * handles site analysis requests
 * 
 * creates or gets a durable object for the site and forwards the analyze request.
 * the durable object handles the actual analysis logic and state management.
 * 
 * flow:
 * 1. parse siteUrl from request body
 * 2. generate consistent siteId from url
 * 3. get/create durable object for this siteId
 * 4. forward request to durable object
 * 
 * @param {Request} request - request containing { siteUrl: string }
 * @param {Object} env - environment with SPEED_DOCTOR durable object binding
 * @param {ExecutionContext} ctx - execution context
 * @returns {Promise<Response>} response from durable object or error response
 */
async function handleAnalyze(request, env, ctx) {
  try {
    const body = await request.json();
    const { siteUrl } = body;

    // validate required field
    if (!siteUrl) {
      return new Response(JSON.stringify({ error: 'site url required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // generate consistent site id from url
    // this ensures same site always gets same durable object instance
    const siteId = generateSiteId(siteUrl);
    
    // get or create durable object for this site
    // idFromName creates a deterministic id from the siteId string
    const durableObjectId = env.SPEED_DOCTOR.idFromName(siteId);
    const durableObject = env.SPEED_DOCTOR.get(durableObjectId);

    // forward request to durable object
    // durable object will handle analysis, state storage, etc
    const response = await durableObject.fetch(request);

    return response;
  } catch (error) {
    // handle any errors during request processing
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * handles chat requests
 * 
 * gets the durable object for the site and forwards the chat request.
 * the durable object maintains chat history and analysis context for the conversation.
 * 
 * @param {Request} request - request containing { siteId: string, message: string }
 * @param {Object} env - environment with SPEED_DOCTOR durable object binding
 * @param {ExecutionContext} ctx - execution context
 * @returns {Promise<Response>} response from durable object or error response
 */
async function handleChat(request, env, ctx) {
  try {
    const body = await request.json();
    const { siteId, message } = body;

    // validate required fields
    if (!siteId || !message) {
      return new Response(JSON.stringify({ error: 'site id and message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // get durable object for this site
    // uses the siteId provided by client (from previous analyze response)
    const durableObjectId = env.SPEED_DOCTOR.idFromName(siteId);
    const durableObject = env.SPEED_DOCTOR.get(durableObjectId);

    // forward chat request to durable object
    // durable object will load chat history, call ai agent, store response
    const response = await durableObject.fetch(request);

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * handles history requests
 * 
 * gets analysis history for a site from its durable object.
 * extracts siteId from url path and forwards request to durable object.
 * 
 * @param {Request} request - request with siteId in path (/api/history/:siteId)
 * @param {Object} env - environment with SPEED_DOCTOR durable object binding
 * @param {ExecutionContext} ctx - execution context
 * @returns {Promise<Response>} response with history array or error response
 */
async function handleHistory(request, env, ctx) {
  try {
    const url = new URL(request.url);
    // extract siteId from path: /api/history/example.com -> example.com
    const siteId = url.pathname.split('/api/history/')[1];

    // validate siteId exists
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
    // durable object will load history from its persistent storage
    const response = await durableObject.fetch(request);

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
