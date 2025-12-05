// ai agent - coordinates with workers ai (llama 3.3) to generate performance insights and chat responses

export class SpeedDoctorAgent {
  constructor(env) {
    this.env = env;
    // TODO: initialize ai model config
  }

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

  async callWorkersAI(prompt) {
    // TODO: use workers ai binding (env.AI.run()) instead of fetch
    // TODO: use llama 3.3 model: @cf/meta/llama-3.3-70b-instruct
    // TODO: handle errors and retries
    // TODO: parse response

    // example using ai binding (preferred):
    // const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
    //   messages: [
    //     { role: 'system', content: 'you are a website performance expert...' },
    //     { role: 'user', content: prompt }
    //   ]
    // });

    try {
      // fallback to direct api call if binding not available
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

