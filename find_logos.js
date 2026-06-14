const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const match = content.match(/<[^>]+class=["']logo["'][^>]*>.*?<\/[^>]+>/s);
  if (match) {
    console.log(f + ': ' + match[0].trim());
  }
});
