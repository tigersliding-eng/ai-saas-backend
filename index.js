require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

function decryptApiKey(encryptedValue, passphrase) {
  const buffer = Buffer.from(encryptedValue, 'base64');
  const iv = buffer.slice(0, 12);
  const authTag = buffer.slice(12, 28);
  const ciphertext = buffer.slice(28);
  const key = crypto.scryptSync(passphrase, 'deepseek-salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext, null, 'utf8') + decipher.final('utf8');
}

function getApiKey() {
  if (process.env.DEEPSEEK_API_KEY) {
    return process.env.DEEPSEEK_API_KEY;
  }

  const encryptedKey = process.env.DEEPSEEK_API_KEY_ENC;
  const passphrase = process.env.DEEPSEEK_KEY_PASSPHRASE;
  if (encryptedKey && passphrase) {
    try {
      return decryptApiKey(encryptedKey, passphrase);
    } catch (err) {
      console.error('Failed to decrypt DEEPSEEK_API_KEY_ENC:', err.message);
    }
  }

  return null;
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (if any)
app.use(express.static('public'));

// Root route with API documentation
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Trade Pro Backend</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-top: 0; }
        .status { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 4px; margin: 10px 0; }
        .endpoint { background: #f0f0f0; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; border-radius: 4px; }
        .method { display: inline-block; padding: 4px 8px; background: #3b82f6; color: white; border-radius: 3px; font-weight: bold; margin-right: 10px; }
        .url { font-family: monospace; font-size: 14px; color: #d97706; margin: 10px 0; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
        pre { background: #1f2937; color: #d1d5db; padding: 15px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 AI Trade Pro Backend</h1>
        <p class="status">✅ Service Running</p>
        <p>DeepSeek-powered customer acquisition plan generator for B2B trade</p>
        
        <h2>Available Endpoints</h2>
        
        <div class="endpoint">
          <div class="method">GET</div>
          <div class="url">/</div>
          <p>Health check and API documentation (this page)</p>
        </div>
        
        <div class="endpoint">
          <div class="method">POST</div>
          <div class="url">/api/generate</div>
          <p>Generate a customer acquisition plan</p>
          <p><strong>Request Body:</strong></p>
          <pre>{
  "industry": "制造业",
  "productName": "智能机床",
  "market": "欧洲",
  "customerType": "中小企业",
  "advantages": "高精度、高效率",
  "language": "zh"
}</pre>
          <p><strong>Response:</strong> JSON object with 5 modules of acquisition strategy</p>
        </div>
        
        <h2>Example Usage</h2>
        <pre>curl -X POST http://localhost:3000/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "industry": "IT",
    "productName": "SaaS Platform",
    "market": "Europe",
    "customerType": "SME",
    "language": "en"
  }'</pre>
        
        <p style="color: #666; margin-top: 30px; font-size: 12px;">
          Powered by DeepSeek API | Node.js + Express
        </p>
      </div>
    </body>
    </html>
  `;
  res.header('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Generate customer acquisition plan
app.post('/api/generate', async (req, res) => {
  const { industry, productName, market, customerType, advantages, language } = req.body;

  if (!industry || !productName || !market || !customerType) {
    return res.status(400).json({ error: 'Missing required fields: industry, productName, market, customerType' });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'DeepSeek API key not configured' });
  }

  const systemPrompt = language === 'zh'
    ? `你是一位拥有20年经验的资深外贸B2B销售顾问。你的任务是根据用户提供的产品、行业和市场信息，生成一份专业的外贸获客方案。

你必须严格按照以下JSON格式输出，不要有任何额外文字：
{
  "module1": {
    "focusPoints": ["客户关注点1", "客户关注点2", "客户关注点3", "客户关注点4"],
    "procurementLogic": "采购逻辑分析（2-3句话）",
    "commonRisks": ["风险1", "风险2", "风险3"]
  },
  "module2": {
    "companySize": "目标公司规模描述",
    "decisionMaker": "决策人画像",
    "purchaseCycle": "采购周期描述",
    "conversionPoint": "最容易成交的关键点"
  },
  "module3": {
    "emailV1": "版本1开发信纯文本字符串，包含Subject和正文，语气专业自信。必须是纯字符串不是对象。",
    "emailV2": "版本2开发信纯文本字符串，包含Subject和正文，语气温和建立关系。必须是纯字符串不是对象。",
    "emailV3": "版本3开发信纯文本字符串，包含Subject和正文，语气直接突出价值。必须是纯字符串不是对象。"
  },
  "module4": {
    "day3": "Day 3跟进话术",
    "day7": "Day 7跟进话术",
    "day14": "Day 14跟进话术"
  },
  "module5": {
    "explanation": "为什么这样写的逻辑解释（2-3句话）",
    "tips": ["建议1", "建议2", "建议3"]
  }
}`
    : `You are a senior B2B foreign trade sales consultant with 20 years of experience. Your task is to generate a professional customer acquisition plan based on the user's product, industry, and market information.

You MUST output strictly in the following JSON format with no extra text:
{
  "module1": {
    "focusPoints": ["Focus point 1", "Focus point 2", "Focus point 3", "Focus point 4"],
    "procurementLogic": "Procurement logic analysis (2-3 sentences)",
    "commonRisks": ["Risk 1", "Risk 2", "Risk 3"]
  },
  "module2": {
    "companySize": "Target company size description",
    "decisionMaker": "Decision maker profile",
    "purchaseCycle": "Purchase cycle description",
    "conversionPoint": "Key conversion point"
  },
  "module3": {
    "emailV1": "Version 1 development letter as a single plain text string containing Subject and body, professional and confident tone. MUST be a plain string, NOT an object.",
    "emailV2": "Version 2 development letter as a single plain text string containing Subject and body, warm relationship-building tone. MUST be a plain string, NOT an object.",
    "emailV3": "Version 3 development letter as a single plain text string containing Subject and body, direct value-focused tone. MUST be a plain string, NOT an object."
  },
  "module4": {
    "day3": "Day 3 follow-up script",
    "day7": "Day 7 follow-up script",
    "day14": "Day 14 follow-up script"
  },
  "module5": {
    "explanation": "Why this approach works (2-3 sentences)",
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
  }
}`;

  const userPrompt = language === 'zh'
    ? `请为以下产品生成外贸获客方案：
- 行业：${industry}
- 产品：${productName}
- 目标市场：${market}
- 客户类型：${customerType}
${advantages ? `- 产品优势：${advantages}` : ''}

重要要求：
1. 开发信英文，其他分析用中文
2. 开发信要真实、专业、有针对性，不要模板化
3. emailV1、emailV2、emailV3 必须是纯文本字符串（string），绝对不能是对象（object）。直接在字符串里写 "Subject: xxx

正文内容" 即可。`
    : `Please generate a foreign trade customer acquisition plan for:
- Industry: ${industry}
- Product: ${productName}
- Target Market: ${market}
- Customer Type: ${customerType}
${advantages ? `- Advantages: ${advantages}` : ''}

IMPORTANT:
1. All development letters must be in English
2. Make them authentic, professional, and targeted — not templated
3. emailV1, emailV2, emailV3 MUST be plain text strings, NEVER objects. Write as "Subject: xxx

Body text" directly in the string.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: `DeepSeek API error: ${errorText}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from the response
    let parsedResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = JSON.parse(content);
      }
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: content });
    }

    res.json({ success: true, result: parsedResult });

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'AI generation timed out. Please try again.' });
    }
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
✅ AI Trade Pro backend running at http://localhost:${PORT}`);
  console.log(`📍 POST http://localhost:${PORT}/api/generate  — Generate customer acquisition plan`);
  console.log(`🔑 DeepSeek API Key: ${process.env.DEEPSEEK_API_KEY ? 'Configured' : 'MISSING — set DEEPSEEK_API_KEY in .env'}
`);
});
