/**
 * agent.js - ai agent for generating performance insights and chat responses
 * 
 * coordinates with cloudflare workers ai (llama 3.3) to:
 * - analyze website performance data and generate insights
 * - respond to chat messages with performance advice
 * - provide cloudflare-specific recommendations
 * 
 * uses workers ai binding or direct api calls to interact with llama 3.3 model.
 * 
 * @module agent
 */

/**
 * speed doctor ai agent class
 * 
 * handles all ai interactions for the site speed doctor application.
 * generates insights from analysis data and responds to user questions.
 */
export class SpeedDoctorAgent {
  /**
   * constructor - initialize ai agent
   * 
   * @param {Object} env - cloudflare workers environment
   *   - env.AI: workers ai binding (preferred method)
   *   - env.ACCOUNT_ID: cloudflare account id (for api calls)
   *   - env.AI_TOKEN: api token (for api calls)
   */
  constructor(env) {
    this.env = env;
    // TODO: initialize ai model config
  }

  /**
   * generates ai-powered insights from analysis data
   * 
   * takes raw performance metrics and generates:
   * - summary of performance issues
   * - prioritized recommendations
   * - cloudflare feature suggestions
   * 
   * @param {Object} analysisData - site analysis data from analyzer
   *   - url: string
   *   - coreWebVitals: object
   *   - caching: object
   *   - assets: object
   *   - cloudflare: object
   *   - metrics: object
   * @returns {Promise<Object>} insights object with summary, recommendations, cloudflareFeatures
   */
  async generateAnalysisInsights(analysisData) {
    // TODO: format analysis data into prompt
    // TODO: call workers ai with llama 3.3 model
    // TODO: parse ai response into structured insights
    // TODO: return formatted insights with recommendations

    const prompt = this.buildAnalysisPrompt(analysisData);
    const insights = await this.callWorkersAI(prompt);

    return {
      summary: insights.summary || 'analysis complete',
      recommendations: insights.recommendations || [],
      cloudflareFeatures: insights.cloudflareFeatures || []
    };
  }

  /**
   * handles chat messages with context
   * 
   * processes user questions about site performance, using:
   * - analysis context (latest analysis data)
   * - chat history (previous conversation)
   * 
   * @param {string} message - user's chat message
   * @param {Object} analysisContext - latest analysis data for context
   * @param {Array} chatHistory - previous chat messages [{ role, content }, ...]
   * @returns {Promise<Object>} response object with text and optional suggestions
   */
  async handleChatMessage(message, analysisContext, chatHistory) {
    // TODO: build chat prompt with context
    // TODO: include relevant analysis data in context
    // TODO: include chat history for conversation continuity
    // TODO: call workers ai with llama 3.3 model
    // TODO: return ai response

    const prompt = this.buildChatPrompt(message, analysisContext, chatHistory);
    const response = await this.callWorkersAI(prompt);

    return {
      response: response.text || 'i need more context',
      suggestions: response.suggestions || []
    };
  }

  /**
   * calls workers ai with a prompt
   * 
   * uses workers ai binding if available, otherwise falls back to direct api call.
   * preferred method is env.AI.run() as it's simpler and faster.
   * 
   * @param {string} prompt - prompt to send to ai
   * @returns {Promise<Object>} parsed ai response
   */
  async callWorkersAI(prompt) {
    // TODO: use workers ai binding (env.AI.run()) instead of fetch
    // TODO: use llama 3.3 model: @cf/meta/llama-3.3-70b-instruct
    // TODO: handle errors and retries
    // TODO: parse response

    // example using ai binding (preferred):
    // if (this.env.AI) {
    //   const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
    //     messages: [
    //       { role: 'system', content: 'you are a website performance expert...' },
    //       { role: 'user', content: prompt }
    //     ]
    //   });
    //   return this.parseAIResponse(response);
    // }

    try {
      // fallback to direct api call if binding not available
      // requires ACCOUNT_ID and AI_TOKEN in env
      const response = await fetch('https://api.cloudflare.com/client/v4/accounts/' + 
        this.env.ACCOUNT_ID + '/ai/run/@cf/meta/llama-3.3-70b-instruct', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.env.AI_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'you are a website performance expert. analyze site speed issues and provide actionable recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      return this.parseAIResponse(data);
    } catch (error) {
      console.error('ai call failed:', error);
      return { text: 'sorry, ai service is temporarily unavailable' };
    }
  }

  /**
   * builds analysis prompt from performance data
   * 
   * formats analysis data into a comprehensive prompt for the ai.
   * includes all relevant metrics and asks for specific outputs.
   * 
   * @param {Object} analysisData - site analysis data
   * @returns {string} formatted prompt for ai
   */
  buildAnalysisPrompt(analysisData) {
    // TODO: construct comprehensive prompt with all analysis metrics
    // TODO: include core web vitals, caching headers, asset sizes, etc
    // TODO: ask ai to prioritize cloudflare-specific recommendations

    return `analyze this website performance data and provide insights:

url: ${analysisData.url}
core web vitals: ${JSON.stringify(analysisData.coreWebVitals)}
caching: ${JSON.stringify(analysisData.caching)}
assets: ${JSON.stringify(analysisData.assets)}

provide a summary, top 5 recommendations, and cloudflare features that could help.`;
  }

  /**
   * builds chat prompt with context
   * 
   * creates a conversational prompt that includes:
   * - system context (performance expert role)
   * - recent analysis data
   * - previous chat messages (for continuity)
   * - current user question
   * 
   * @param {string} message - user's current message
   * @param {Object} analysisContext - latest analysis data
   * @param {Array} chatHistory - previous messages (last 5)
   * @returns {string} formatted prompt for ai
   */
  buildChatPrompt(message, analysisContext, chatHistory) {
    // TODO: build conversational prompt
    // TODO: include recent analysis context
    // TODO: include last few chat messages for context
    // TODO: make it feel natural and helpful

    let prompt = `you are helping a user improve their website performance. `;
    
    if (analysisContext) {
      prompt += `recent analysis shows: ${JSON.stringify(analysisContext)}. `;
    }

    if (chatHistory && chatHistory.length > 0) {
      prompt += `previous conversation:\n`;
      chatHistory.slice(-5).forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
    }

    prompt += `\nuser question: ${message}\n\nprovide a helpful response.`;

    return prompt;
  }

  /**
   * parses ai response into structured format
   * 
   * handles different response formats from workers ai.
   * extracts text content and attempts to parse structured data.
   * 
   * @param {Object} data - raw response from ai api
   * @returns {Object} parsed response with text and optional structured data
   */
  parseAIResponse(data) {
    // TODO: extract text from ai response
    // TODO: try to extract structured data if ai returns json
    // TODO: handle different response formats

    if (data.result && data.result.response) {
      return { text: data.result.response };
    }

    if (data.response) {
      return { text: data.response };
    }

    return { text: JSON.stringify(data) };
  }
}
