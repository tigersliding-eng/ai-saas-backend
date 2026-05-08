# AI Trade Pro Backend Deployment Guide

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DEEPSEEK_API_KEY=sk-your-api-key-here
PORT=3000
```

Or use encrypted API key:

```env
DEEPSEEK_API_KEY_ENC=<base64-encrypted-key>
DEEPSEEK_KEY_PASSPHRASE=your-passphrase
PORT=3000
```

To encrypt your API key:

```bash
npm run encrypt:key sk-your-api-key-here your-passphrase
```

## Deployment Options

### 1. Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DEEPSEEK_API_KEY=sk-your-api-key-here

# Deploy
git push heroku main
```

### 2. Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# DEEPSEEK_API_KEY=sk-your-api-key-here
```

### 3. Railway

1. Connect your GitHub repository
2. Add environment variable `DEEPSEEK_API_KEY`
3. Deploy automatically

### 4. Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY index.js encrypt-key.js ./

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t ai-trade-pro .
docker run -e DEEPSEEK_API_KEY=sk-xxx -p 3000:3000 ai-trade-pro
```

## API Endpoints

### Health Check
- **GET** `/` - Returns HTML dashboard with API documentation

### Generate Plan
- **POST** `/api/generate`
- Body: `{ industry, productName, market, customerType, advantages, language }`
- Response: Customer acquisition plan with 5 modules

## Monitoring

- Check service status: `GET http://your-domain.com/`
- View logs: Platform-specific (Heroku: `heroku logs --tail`)
- Monitor API: `POST http://your-domain.com/api/generate`

## Troubleshooting

### Port Already in Use
```bash
# Use a different port
PORT=3001 npm start
```

### API Key Not Configured
```bash
# Verify .env file exists and contains DEEPSEEK_API_KEY
cat .env
```

### DeepSeek API Errors
- Check API key validity
- Verify network connectivity
- Check API quota and billing

## Support

For issues, check the GitHub repository or contact support.
