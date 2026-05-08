// Cloudflare EdgeOne / Workers Configuration

## Setup EdgeOne with Cloudflare Workers

### 1. Install Wrangler CLI
\`\`\`bash
npm install -g wrangler
\`\`\`

### 2. Authenticate
\`\`\`bash
wrangler login
\`\`\`

### 3. Configure wrangler.toml
- Update \`account_id\` with your Cloudflare Account ID
- Set \`zone_id\` for your domain
- Update \`route\` with your API endpoint

### 4. Set Environment Variables
\`\`\`bash
wrangler secret put DEEPSEEK_API_KEY
# Enter your API key when prompted
\`\`\`

### 5. Deploy
\`\`\`bash
wrangler publish
\`\`\`

## Features
- ✅ Edge computing on 200+ data centers worldwide
- ✅ Ultra-low latency
- ✅ DDoS protection built-in
- ✅ Automatic SSL/TLS
- ✅ Caching at edge

## Monitoring
- View logs: \`wrangler tail\`
- Monitor analytics: Cloudflare Dashboard
- Real-time metrics: https://dash.cloudflare.com

## Cost
- Free tier: 100,000 requests/day
- Paid: \$0.50 per million requests after free tier
