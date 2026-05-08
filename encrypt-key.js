const crypto = require('crypto');

if (process.argv.length < 4) {
  console.error('Usage: node encrypt-key.js <DEEPSEEK_API_KEY> <PASSPHRASE>');
  process.exit(1);
}

const [,, apiKey, passphrase] = process.argv;
const iv = crypto.randomBytes(12);
const key = crypto.scryptSync(passphrase, 'deepseek-salt', 32);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

const ciphertext = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
const authTag = cipher.getAuthTag();
const payload = Buffer.concat([iv, authTag, ciphertext]).toString('base64');

console.log(payload);
