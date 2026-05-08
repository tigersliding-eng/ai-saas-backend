const axios = require('axios');

async function testGenerate() {
  try {
    const response = await axios.post('http://127.0.0.1:3000/api/generate', {
      industry: '制造业',
      productName: '智能机床',
      market: '欧洲',
      customerType: '中小企业',
      advantages: '高精度、高效率',
      language: 'zh'
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testGenerate();