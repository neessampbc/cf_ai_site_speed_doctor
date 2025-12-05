# AI site speed doctor
an AI powered performance auditor built on Cloudflare Workers. you can use it to scan any website, analyze caching and asset delivery, and get suggestions to improve speed, core web vitals, and cloudflare feature usage. memory-enabled performance history using durable objects.

includes: 
- website performance analysis (core web vitals, caching, assets)
- chat interface for asking questions about performance
- analysis history stored in durable objects
- Cloudflare feature detection and recommendations

## Components

- **Workers AI**: uses llama 3.3 model to generate performance insights and chat responses
- **Durable Objects**: stores analysis history and chat context per site
- **Pages Frontend**: simple web interface for analyzing sites and chatting with ai
- **Workers** - coordinates between analyzer, agent, and durable objects

## Setup

### Prerequisites

- node.js 18+ installed
- Cloudflare account with Workers AI enabled
- wrangler cli installed globally: `npm install -g wrangler`

### Installation

1. clone the repo
2. install dependencies:
   ```bash
   npm install
   ```

3. configure cloudflare:
   ```bash
   wrangler login
   ```

4. set secrets (required for Workers AI):
   ```bash
   wrangler secret put ACCOUNT_ID
   wrangler secret put AI_TOKEN
   ```

### local development

**Run worker locally:**
```bash
npm run dev
```

**Run pages frontend locally:**
```bash
npm run pages:dev
```

the worker will be available at `http://localhost:8787` and pages at `http://localhost:8788`

### Deployment

**Deploy worker:**
```bash
npm run deploy
```

**Deploy pages:**
```bash
npm run pages:deploy
```

after deployment, update the `API_BASE` constant in `frontend/script.js` to point to your deployed worker url.

## Usage

### API endpoints

- `POST /api/analyze` - analyze a website
  ```json
  {
    "siteUrl": "https://example.com"
  }
  ```

- `POST /api/chat` - chat with ai about site performance
  ```json
  {
    "siteId": "example.com",
    "message": "how can i improve my lcp score?"
  }
  ```

- `GET /api/history/:siteId` - get analysis history for a site

### Frontend

1. open the pages frontend url
2. enter a website url and click "analyze"
3. view analysis results
4. chat with ai about performance improvements
5. view analysis history


## TODO

see TODO comments in source files for implementation details. main areas:

- complete analyzer metrics collection
- implement workers ai integration
- finish durable object state management
- enhance frontend visualization
- add real-time updates

## Notes

- workers ai requires account id and api token
- durable objects need to be migrated on first deploy
- frontend needs worker url configured after deployment
- see PROMPTS.md for ai assistance details
