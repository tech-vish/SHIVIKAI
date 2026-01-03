const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const content = 'GROQ_API_KEY=gsk_CIASyklslcdshvDj28A1NhF8hLWGdyb3FYo4cET8rEd6MoQO3YQ\n';

try {
  fs.writeFileSync(envPath, content, { encoding: 'utf8' });
  console.log('.env.local has been written successfully with UTF-8 encoding at:', envPath);
} catch (err) {
  console.error('Failed to write .env.local:', err);
}
